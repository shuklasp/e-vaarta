/* MPL-2.0 */
export const DEFAULT_SEARCH_STATE = Object.freeze({ query:"", kind:"all", collectionId:null, documentId:null, page:1, limit:50 });
export function normalizeSearchState(input={}) {
  const state={...DEFAULT_SEARCH_STATE,...input};
  return { query:String(state.query||"").trim(), kind:String(state.kind||"all"), collectionId:state.collectionId||null, documentId:state.documentId||null, page:Math.max(1,Number(state.page)||1), limit:Math.min(200,Math.max(1,Number(state.limit)||50)) };
}
export function nextSearchPage(state) { const s=normalizeSearchState(state); return {...s,page:s.page+1}; }
