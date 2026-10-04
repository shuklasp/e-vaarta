/* MPL-2.0 */
export const ReaderNavigationKind = Object.freeze({ DOCUMENT:"document", EVIDENCE:"evidence", PAGE:"page" });
export function createReaderNavigation({ documentId, itemId=null, page=null, reason="user" }={}) {
  if (!documentId) throw new TypeError("documentId is required.");
  return { version:1, kind:itemId?ReaderNavigationKind.EVIDENCE:page!=null?ReaderNavigationKind.PAGE:ReaderNavigationKind.DOCUMENT, documentId, itemId, page, reason, createdAt:new Date().toISOString() };
}
export function canNavigateToDocument(workspace, documentId) { return Boolean(workspace?.documents?.some(d=>d.id===documentId)); }
export function canNavigateToItem(workspace, itemId) { return Boolean(workspace?.items?.some(i=>i.id===itemId)); }