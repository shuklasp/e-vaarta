/* MPL-2.0 */
function key(e){return e.id||JSON.stringify(e);}
export function mergeSemanticEvents(base,left,right){
  const b=new Map(base.map(key).map((k,i)=>[k,base[i]])), l=new Map(left.map(key).map((k,i)=>[k,left[i]])), r=new Map(right.map(key).map((k,i)=>[k,right[i]]));
  const keys=new Set([...b.keys(),...l.keys(),...r.keys()]), events=[],conflicts=[];
  for(const k of [...keys].sort()){
    const bv=b.get(k),lv=l.get(k),rv=r.get(k);
    if(JSON.stringify(lv)===JSON.stringify(rv)){if(lv)events.push(lv);continue;}
    if(JSON.stringify(lv)===JSON.stringify(bv)){if(rv)events.push(rv);continue;}
    if(JSON.stringify(rv)===JSON.stringify(bv)){if(lv)events.push(lv);continue;}
    if(lv&&rv) conflicts.push({id:k,base:bv||null,left:lv,right:rv});
    else events.push(lv||rv);
  }
  return {events,conflicts,hasConflicts:conflicts.length>0};
}
