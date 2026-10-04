/* MPL-2.0 */
export function presentSearchResults(results=[]){return results.map(r=>({id:r.id,type:r.type,title:r.title||r.type,text:r.text||"",documentId:r.documentId||null}));}