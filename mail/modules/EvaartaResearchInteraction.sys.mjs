/* MPL-2.0 */
/** LiquidText-class interaction model, independent of UI toolkit. */
export const ResearchInteraction = Object.freeze({
  EXTRACT: "extract", PIN: "pin", CONNECT: "connect", FOCUS: "focus",
  COMPARE: "compare", TRACE: "trace", EXPORT: "export",
});
export function createResearchWorkspace({ id, sources = [], cards = [], regions = [], links = [] }) {
  if (!id) throw new TypeError("workspace id is required");
  return Object.freeze({ id, sources: [...sources], cards: structuredClone(cards), regions: structuredClone(regions), links: structuredClone(links) });
}
export function createResearchCard({ id, sourceId, anchor, text = "", color = null, note = "" }) {
  if (!id || !sourceId || !anchor) throw new TypeError("id, sourceId and anchor are required");
  return Object.freeze({ id, sourceId, anchor: structuredClone(anchor), text, color, note });
}
export function createResearchLink({ from, to, type = "supports" }) {
  if (!from || !to || from === to) throw new TypeError("valid distinct endpoints are required");
  return Object.freeze({ from, to, type });
}
export function traceResearchCard(card, documents = []) {
  return documents.find(document => document.id === card.sourceId) || null;
}
