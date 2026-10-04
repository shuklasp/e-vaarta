/* MPL-2.0 */
export function diffLines(before,after){
 const a=String(before??"").split(/\r?\n/),b=String(after??"").split(/\r?\n/),out=[],n=Math.max(a.length,b.length);
 for(let i=0;i<n;i++){if(a[i]===b[i])out.push({type:"equal",line:i+1,text:a[i]??""});else{if(a[i]!==undefined)out.push({type:"removed",line:i+1,text:a[i]});if(b[i]!==undefined)out.push({type:"added",line:i+1,text:b[i]});}}
 return out;
}
export function changedEvidence(before,after){return diffLines(before,after).filter(x=>x.type!=="equal");}
