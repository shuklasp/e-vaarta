/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  classifyWorkspaceWrite,
  deserializeWorkspaceRecord,
  nextWorkspaceRecord,
  serializeWorkspaceRecord,
  WorkspaceWriteStatus,
} from "./EvaartaWorkspacePersistence.sys.mjs";

export const DEFAULT_DIRECTORY = "evaarta/workspaces";
const PRIMARY_SUFFIX = ".json";
const BACKUP_SUFFIX = ".bak";
const TEMP_SUFFIX = ".tmp";

function defaultIO() {
  return globalThis.IOUtils;
}

function defaultPaths() {
  return globalThis.PathUtils;
}

function workspaceFileName(workspaceId) {
  return encodeURIComponent(String(workspaceId)).replaceAll("%", "_");
}

/**
 * Crash-safe local persistence for one e-Vaarta workspace.
 *
 * Each workspace has a current snapshot and a last-known-good backup.
 * IOUtils.writeAtomic() ensures the replacement is not exposed half-written.
 */
export class EvaartaWorkspaceStore {
  constructor(rootPath, { io = defaultIO(), paths = defaultPaths() } = {}) {
    if (!rootPath) throw new TypeError("rootPath is required.");
    this.rootPath = rootPath;
    this.io = io;
    this.paths = paths;
  }

  pathsFor(workspaceId) {
    const file = workspaceFileName(workspaceId) + PRIMARY_SUFFIX;
    return {
      directory: this.rootPath,
      primary: this.paths.join(this.rootPath, file),
      backup: this.paths.join(this.rootPath, file + BACKUP_SUFFIX),
      temp: this.paths.join(this.rootPath, file + TEMP_SUFFIX),
    };
  }

  async ensureDirectory() {
    await this.io.makeDirectory(this.rootPath, { ignoreExisting: true });
  }

  async save(workspace, { writerId = "local", writtenAt } = {}) {
    if (!workspace?.id) throw new TypeError("A workspace with an id is required.");
    await this.ensureDirectory();

    const paths = this.pathsFor(workspace.id);
    let current = null;

    try {
      current = await this.#readRecord(paths.primary);
    } catch (error) {
      if (!this.#isMissing(error)) {
        try {
          current = await this.#readRecord(paths.backup);
        } catch (backupError) {
          if (!this.#isMissing(backupError)) throw backupError;
        }
      }
    }

    const next = nextWorkspaceRecord(current, workspace, {
      writerId,
      ...(writtenAt ? { writtenAt } : {}),
    });

    const status = classifyWorkspaceWrite(current, next);
    if (status === WorkspaceWriteStatus.CONFLICT) {
      throw new Error("Workspace write conflicts with the current revision.");
    }

    await this.io.writeAtomic(
      paths.primary,
      serializeWorkspaceRecord(next),
      {
        tmpPath: paths.temp,
        backupTo: paths.backup,
        flush: true,
      }
    );

    return { record: next, status, path: paths.primary };
  }

  /**
   * Returns the primary snapshot when valid, otherwise the last-known-good
   * backup. A corrupt primary is never returned to callers.
   */
  async load(workspaceId) {
    const paths = this.pathsFor(workspaceId);
    const failures = [];

    for (const candidate of [paths.primary, paths.backup]) {
      try {
        const record = await this.#readRecord(candidate);
        if (record.workspaceId !== workspaceId) {
          throw new Error("Workspace identity mismatch.");
        }
        return {
          record,
          source: candidate === paths.primary ? "primary" : "backup",
          recovered: candidate === paths.backup,
        };
      } catch (error) {
        if (!this.#isMissing(error)) failures.push({ path: candidate, error });
      }
    }

    if (!failures.length) return null;

    const detail = failures
      .map(({ path, error }) => path + ": " + error.message)
      .join("; ");
    throw new Error(
      "No valid e-Vaarta workspace snapshot is available. " + detail
    );
  }

  /**
   * Repairs the primary snapshot from a valid backup without changing its
   * semantic workspace revision.
   */
  async recover(workspaceId) {
    const loaded = await this.load(workspaceId);
    if (!loaded) return null;
    if (!loaded.recovered) return loaded;

    const paths = this.pathsFor(workspaceId);
    await this.io.writeAtomic(
      paths.primary,
      serializeWorkspaceRecord(loaded.record),
      {
        tmpPath: paths.temp,
        backupTo: paths.backup,
        flush: true,
      }
    );

    return { ...loaded, source: "primary", recovered: true };
  }

  async remove(workspaceId) {
    const paths = this.pathsFor(workspaceId);
    for (const path of [paths.primary, paths.backup, paths.temp]) {
      try {
        await this.io.remove(path);
      } catch (error) {
        if (!this.#isMissing(error)) throw error;
      }
    }
  }

  async #readRecord(path) {
    return deserializeWorkspaceRecord(await this.io.readUTF8(path));
  }

  #isMissing(error) {
    return error?.becauseNoSuchFile === true ||
      error?.name === "NotFoundError" ||
      error?.code === "ENOENT";
  }
}
