/* MPL-2.0 */
function timestamp(value) { return Date.parse(value || "") || 0; }
export function buildWorkspaceActivity(workspace, { limit = 50 } = {}) {
  const events = [];
  for (const document of workspace?.documents || []) events.push({ type: "document", id: document.id, title: document.title, at: document.updatedAt || document.createdAt });
  for (const item of workspace?.items || []) events.push({ type: item.kind || "item", id: item.id, title: item.title || item.text?.slice(0, 80) || "Untitled", documentId: item.anchor?.documentId || null, at: item.updatedAt || item.createdAt });
  for (const link of workspace?.links || []) events.push({ type: "link", id: link.id, at: link.updatedAt || link.createdAt, fromId: link.fromId, toId: link.toId });
  return events.filter(e => e.id).sort((a,b) => timestamp(b.at)-timestamp(a.at) || a.id.localeCompare(b.id)).slice(0, Math.max(0, limit));
}
