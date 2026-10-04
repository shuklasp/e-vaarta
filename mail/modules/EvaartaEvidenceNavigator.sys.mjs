/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Canonical source-evidence queries for e-Vaarta.
 *
 * This module is intentionally UI-free. It derives evidence navigation data
 * from the persisted workspace model instead of maintaining a second index.
 * Desktop, Android, and iOS clients can therefore implement different
 * presentation layers while agreeing on the same evidence ordering and
 * membership semantics.
 */

export const EVAARTA_EVIDENCE_QUERY_VERSION = 1;

const ANCHORED_KINDS = new Set(["excerpt", "annotation"]);

function normalizePage(page) {
  return Number.isFinite(Number(page)) ? Number(page) : null;
}

function sourcePosition(item) {
  const anchor = item?.anchor || {};
  const page = normalizePage(anchor.page);
  const offset = Number.isFinite(Number(anchor.startOffset))
    ? Number(anchor.startOffset)
    : Number.MAX_SAFE_INTEGER;
  return {
    page: page == null ? Number.MAX_SAFE_INTEGER : page,
    offset,
  };
}

function compareEvidence(a, b) {
  const pa = sourcePosition(a);
  const pb = sourcePosition(b);
  if (pa.page !== pb.page) return pa.page - pb.page;
  if (pa.offset !== pb.offset) return pa.offset - pb.offset;
  const ta = String(a?.createdAt || "");
  const tb = String(b?.createdAt || "");
  if (ta !== tb) return ta.localeCompare(tb);
  return String(a?.id || "").localeCompare(String(b?.id || ""));
}

function evidenceItems(workspace, documentId) {
  if (!workspace || !documentId) return [];
  return (workspace.items || [])
    .filter(item =>
      ANCHORED_KINDS.has(item?.kind) &&
      item?.anchor?.documentId === documentId
    );
}

function groupContains(group, itemId) {
  return Array.isArray(group?.itemIds) && group.itemIds.includes(itemId);
}

/**
 * Return all anchored evidence for one source in deterministic source order.
 *
 * Supported options:
 * - kind: "excerpt" or "annotation"
 * - page: one PDF/source page number
 * - groupId: restrict to members of one evidence group
 */
export function getEvidenceForDocument(workspace, documentId, options = {}) {
  const kind = options.kind || null;
  const page = options.page == null ? null : normalizePage(options.page);
  const groupId = options.groupId || null;

  let items = evidenceItems(workspace, documentId);

  if (kind) {
    items = items.filter(item => item.kind === kind);
  }

  if (page != null) {
    items = items.filter(item => normalizePage(item.anchor?.page) === page);
  }

  if (groupId) {
    const group = (workspace.evidenceGroups || []).find(item => item.id === groupId);
    if (!group) return [];
    items = items.filter(item => groupContains(group, item.id));
  }

  return items.slice().sort(compareEvidence);
}

/**
 * Return evidence groups which contain evidence anchored to a source.
 *
 * A group is included only when at least one of its members resolves to the
 * requested document. Group membership is derived from itemIds, never cached.
 */
export function getEvidenceGroupsForDocument(workspace, documentId) {
  if (!workspace || !documentId) return [];

  const evidenceIds = new Set(evidenceItems(workspace, documentId).map(item => item.id));
  return (workspace.evidenceGroups || [])
    .filter(group => (group.itemIds || []).some(itemId => evidenceIds.has(itemId)))
    .map(group => ({
      ...group,
      evidenceCount: (group.itemIds || []).filter(itemId => evidenceIds.has(itemId)).length,
    }))
    .sort((a, b) =>
      String(a.name || "").localeCompare(String(b.name || "")) ||
      String(a.id || "").localeCompare(String(b.id || ""))
    );
}

/**
 * Return a compact, derived source-evidence summary suitable for cards and
 * navigation headers.
 */
export function getEvidenceSummary(workspace, documentId) {
  const evidence = getEvidenceForDocument(workspace, documentId);
  const groups = getEvidenceGroupsForDocument(workspace, documentId);

  const pages = [...new Set(
    evidence
      .map(item => normalizePage(item.anchor?.page))
      .filter(page => page != null)
  )].sort((a, b) => a - b);

  return {
    documentId,
    evidenceCount: evidence.length,
    excerptCount: evidence.filter(item => item.kind === "excerpt").length,
    annotationCount: evidence.filter(item => item.kind === "annotation").length,
    groupCount: groups.length,
    pages,
  };
}
