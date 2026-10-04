/* MPL-2.0 */
/** Local Markdown vault contract with Obsidian-compatible primitives. */
export function createMarkdownDocument({ id, path, markdown = "", frontmatter = {}, revisionId = null }) {
  if (!id || !path) throw new TypeError("id and path are required");
  return Object.freeze({ id, path, markdown, frontmatter: structuredClone(frontmatter), revisionId });
}
export function parseFrontmatter(markdown = "") {
  const match = String(markdown).match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { frontmatter: {}, body: String(markdown) };
  const frontmatter = {};
  for (const line of match[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) frontmatter[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { frontmatter, body: String(markdown).slice(match[0].length) };
}
export function createVaultIndex(documents = []) {
  const byId = new Map(), byTag = new Map(), links = new Map();
  for (const document of documents) {
    byId.set(document.id, document);
    for (const tag of document.frontmatter?.tags || []) {
      if (!byTag.has(tag)) byTag.set(tag, []);
      byTag.get(tag).push(document.id);
    }
    links.set(document.id, [...String(document.markdown).matchAll(/\[\[([^\]]+)\]\]/g)].map(m => m[1]));
  }
  return Object.freeze({ byId, byTag, links });
}
