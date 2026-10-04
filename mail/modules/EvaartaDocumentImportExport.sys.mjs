/* MPL-2.0 */
export const EVAARTA_BUNDLE_VERSION=1;
export function createProjectBundle({project,graph,canvases=[],documents=[],events=[],attachments=[],metadata={}}={}){
 return {format:"application/vnd.evaarta.project+json",version:EVAARTA_BUNDLE_VERSION,createdAt:new Date().toISOString(),metadata,project,graph,canvases,documents,events,attachments};
}
export function validateProjectBundle(bundle){
 if(!bundle||bundle.format!=="application/vnd.evaarta.project+json"||bundle.version!==EVAARTA_BUNDLE_VERSION)throw new Error("Unsupported e-Vaarta project bundle");
 if(!bundle.project||!bundle.graph)throw new Error("Project bundle requires project and graph");
 return true;
}
export function serializeProjectBundle(bundle){validateProjectBundle(bundle);return JSON.stringify(bundle,null,2);}
export function deserializeProjectBundle(value){const b=typeof value==="string"?JSON.parse(value):value;validateProjectBundle(b);return b;}
export function exportEvidenceReport(graph,{title="Evidence Report"}={}){
 const entities=graph?.entities||[];const evidence=entities.filter(e=>e.kind==="evidence");const claims=entities.filter(e=>e.kind==="claim");const findings=entities.filter(e=>e.kind==="finding");return {title,generatedAt:new Date().toISOString(),summary:{evidence:evidence.length,claims:claims.length,findings:findings.length},evidence,claims,findings,relations:graph?.relations||[]};
}
