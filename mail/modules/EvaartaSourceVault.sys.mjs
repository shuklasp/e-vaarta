import { createLocalVaultRecord } from "./EvaartaDocumentWorkspace.sys.mjs";

export function createSourceVaultEntry(options = {}) {
  if (!options.relativePath && !options.sourceRef) throw new TypeError("A local path or source reference is required.");
  return { ...createLocalVaultRecord(options), sourceRef: options.sourceRef || null, status: "available" };
}
export function sourceVaultStatus(entry, exists = true) {
  return { ...entry, status: exists ? "available" : "missing" };
}
