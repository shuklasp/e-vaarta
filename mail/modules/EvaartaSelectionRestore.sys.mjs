/* MPL-2.0 */
export function restoreSelection(ids,workspace){const known=new Set((workspace?.items||[]).map(i=>i.id));return(ids||[]).filter(id=>known.has(id))}