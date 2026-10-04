/* MPL-2.0 */
export const AccessibilityRole=Object.freeze({SOURCE:"source",EVIDENCE:"evidence",NOTE:"note",ANNOTATION:"annotation",LINK:"relationship"});
export function accessibleLabelForItem(item){if(!item)return"e-Vaarta item";const kind=item.kind||"item",title=item.title||item.text?.trim().slice(0,80)||"Untitled",page=item.anchor?.page?`, page ${item.anchor.page}`:"";return `${kind}: ${title}${page}`;}
export function keyboardOrder(items=[]){return[...items].sort((a,b)=>String(a.title||"").localeCompare(String(b.title||""))||String(a.id).localeCompare(String(b.id)));}
