/* MPL-2.0 */

/**
 * Open knowledge-layer primitives: Markdown blocks, properties, aliases,
 * references, transclusion and JSON-Canvas-compatible spatial objects.
 */

export function createKnowledgeBlock({
  id, type = "paragraph", text = "", source = null, properties = {},
}) {
  if (!id) throw new TypeError("block id is required");
  return Object.freeze({
    id, type, text, source: source ? structuredClone(source) : null,
    properties: { ...properties },
  });
}

export function createBlockReference(blockId, range = null) {
  if (!blockId) throw new TypeError("blockId is required");
  return Object.freeze({ blockId, range });
}

export function createTransclusion(reference, mode = "block") {
  if (!reference?.blockId) throw new TypeError("block reference is required");
  return Object.freeze({ reference: structuredClone(reference), mode });
}

export function createKnowledgeProperty(name, value, type = "text") {
  if (!name) throw new TypeError("property name is required");
  return Object.freeze({ name, value, type });
}

export function createCanvasNode(id, x = 0, y = 0, width = 320, height = 180) {
  if (!id) throw new TypeError("canvas node id is required");
  return Object.freeze({ id, x, y, width, height });
}

export function createCanvasEdge(fromNode, toNode, label = null) {
  if (!fromNode || !toNode) throw new TypeError("edge endpoints are required");
  return Object.freeze({ fromNode, toNode, label });
}

export function createKnowledgeDocument({
  id, title = "", markdown = "", aliases = [], properties = {},
}) {
  if (!id) throw new TypeError("document id is required");
  return Object.freeze({
    id, title, markdown, aliases: [...aliases], properties: { ...properties },
  });
}
