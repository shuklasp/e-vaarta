/* MPL-2.0 */
const DOI=/\b10\.\d{4,9}\/[^\s"<>]+/ig;
const ISBN=/\b(?:97[89][\- ]?)?(?:\d[\- ]?){9}[\dXx]\b/g;
export function extractIdentifiers(text){
  return {doi:[...new Set((String(text).match(DOI)||[]).map(x=>x.replace(/[.,;:)]+$/,"").toLowerCase()))],
    isbn:[...new Set((String(text).match(ISBN)||[]).map(x=>x.replace(/[ -]/g,"")))]};
}
export function parseBibTeX(input){
  const records=[]; const re=/@([^{]+)\{([^,]+),([\s\S]*?)\n\s*\}/g; let m;
  while((m=re.exec(String(input)))){const fields={}; for(const f of m[3].matchAll(/([A-Za-z]+)\s*=\s*[{"]([\s\S]*?)[}"]\s*,?/g)) fields[f[1].toLowerCase()]=f[2].trim(); records.push({type:m[1].trim(),key:m[2].trim(),...fields});}
  return records;
}
export function toCSL(record){
  const out={id:record.key||record.id||crypto.randomUUID?.()||String(Date.now()),title:record.title||""};
  if(record.author) out.author=record.author.split(/\s+and\s+/i).map(name=>{const p=name.split(",").map(s=>s.trim());return p.length>1?{family:p[0],given:p[1]}:{literal:name};});
  if(record.year) out.issued={"date-parts":[[Number(record.year)]]};
  if(record.journal) out["container-title"]=record.journal;
  if(record.doi) out.DOI=record.doi.replace(/^https?:\/\/doi.org\//i,"");
  return out;
}
