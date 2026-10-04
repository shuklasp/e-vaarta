/* MPL-2.0 */
export function createWorkspaceSurface(controller) {
  if (!controller) throw new TypeError("controller is required.");
  return { id:"evaarta-workspace", offline:true, controller, regions:["navigation","documents","reader","evidence","inspector"], commands:["open","search","selectDocument","selectItem","back","forward"] };
}
export function reduceWorkspaceSurface(state, action={}) {
  const next=structuredClone(state||{});
  switch(action.type){case "selectDocument": next.selectedDocumentId=action.id||null; next.selectedItemId=null; break; case "selectItem": next.selectedItemId=action.id||null; break; case "search": next.search=action.search||next.search; break; case "clearSelection": next.selectedDocumentId=null; next.selectedItemId=null; break; default: break;} return next;
}