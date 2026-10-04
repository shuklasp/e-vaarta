/* MPL-2.0 */
export const EXPORT_FORMAT=Object.freeze({EML:"eml",MBOX:"mbox",MAILDIR:"maildir",PDF:"pdf",PDF_A:"pdf-a",DOCX:"docx",PPTX:"pptx",XLSX:"xlsx",MD:"markdown",HTML:"html",ICS:"ics",VCARD:"vcard",BIBTEX:"bibtex",RIS:"ris",CSL_JSON:"csl-json",JSON:"evaarta-json"});
export function createExportPlan({entityType,entityIds=[],formats=[]}={}){return Object.freeze({entityType,entityIds:[...entityIds],formats:[...formats].filter(f=>Object.values(EXPORT_FORMAT).includes(f)),lossPolicy:"report-loss",includeProvenance:true});}
export function migrationManifest({source,items=[],warnings=[]}={}){return Object.freeze({source,items:[...items],warnings:[...warnings],preserveProvenance:true});}
export function interoperabilityResult({format,preserved=[],converted=[],lost=[],warnings=[]}={}){return Object.freeze({format,preserved,converted,lost,warnings,roundTripReady:lost.length===0});}
