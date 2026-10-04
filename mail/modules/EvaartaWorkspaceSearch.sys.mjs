export const EVAARTA_SEARCH_VERSION = 1;

function textFor(workspace, item) {
  const document = workspace.documents?.find(doc => doc.id === item.anchor?.documentId);
  return [
    item.title, item.text, item.anchor?.quote, document?.title,
    document?.description, ...(document?.tags || []),
  ].filter(Boolean).join(" ").toLocaleLowerCase();
}

export function searchWorkspace(workspace, query, options = {}) {
  const needle = String(query || "").trim().toLocaleLowerCase();
  if (!needle) return [];
  const limit = Math.max(1, Number(options.limit) || 50);
  const results = [];
  for (const document of workspace.documents || []) {
    const text = [document.title, document.description, ...(document.tags || [])]
      .filter(Boolean).join(" ").toLocaleLowerCase();
    if (text.includes(needle)) {
      results.push({ type: "document", id: document.id, documentId: document.id,
        title: document.title, score: text === needle ? 1 : 0.5 });
    }
  }
  for (const item of workspace.items || []) {
    const text = textFor(workspace, item);
    if (text.includes(needle)) {
      results.push({ type: item.kind, id: item.id, documentId: item.anchor?.documentId || null,
        title: item.title || item.kind, text: item.text || item.anchor?.quote || "",
        score: text === needle ? 1 : 0.5 });
    }
  }
  return results.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, limit);
}
