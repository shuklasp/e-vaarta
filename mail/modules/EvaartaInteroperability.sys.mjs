/* MPL-2.0 */
const formats=new Set(["eml","mbox","maildir","pdf","docx","pptx","xlsx","markdown","html","bibtex","ris","csl-json","opml","ics","evaarta-json"]);
export function supportedFormats(){return [...formats].sort();}
export function canImport(format){return formats.has(String(format).toLowerCase());}
export function lossReport(source,target,fields=[]){
  const compatible=source===target||target==="evaarta-json";
  return {source,target,lossless:compatible,lostFields:compatible?[]:fields,warning:compatible?null:"Target format may not preserve e-Vaarta provenance."};
}
export function projectBundle(project){return JSON.stringify({schema:"evaarta.project.v1",exportedAt:new Date().toISOString(),project},null,2);}
