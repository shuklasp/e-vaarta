/* MPL-2.0 */
export const CitationFormat=Object.freeze({BIBTEX:"bibtex",RIS:"ris",CSL_JSON:"csl-json"});
export function createCitation({documentId,title,authors=[],year=null,doi=null,url=null,publisher=null}={}){return{documentId,title,authors,year,doi,url,publisher};}
export function toBibTeX(c){const key=(c.authors?.[0]||"source").replace(/[^A-Za-z0-9]/g,"").toLowerCase()+"-"+(c.year||"nd");return "@misc{"+key+",\n  title = {"+String(c.title||"").replace(/[{}]/g,"")+"},\n  author = {"+(c.authors||[]).join(" and ")+"},\n  year = {"+(c.year||"")+"}"+(c.doi?",\n  doi = {"+c.doi+"}":"")+(c.url?",\n  url = {"+c.url+"}":"")+"\n}";}
export function toRis(c){return["TY  - GEN","TI  - "+(c.title||""),...(c.authors||[]).map(a=>"AU  - "+a),c.year?"PY  - "+c.year:null,c.doi?"DO  - "+c.doi:null,c.url?"UR  - "+c.url:null,"ER  - "].filter(Boolean).join("\n");}
