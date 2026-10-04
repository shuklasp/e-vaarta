/* MPL-2.0 */
export const RELEASE_ARTIFACT=Object.freeze({BUILD:"build",SBOM:"sbom",PROVENANCE:"provenance",SIGNATURE:"signature",MIGRATION:"migration",ROLLBACK:"rollback",CRASH:"crash-report"});
export function createReleaseManifest({version,commit,platforms=[],artifacts=[],validation=[]}={}){return Object.freeze({version,commit,platforms:[...platforms],artifacts:[...artifacts],validation:[...validation],reproducible:true});}
export function releaseReadiness({required=[],evidence=[]}={}){const set=new Set(evidence);const missing=required.filter(x=>!set.has(x));return Object.freeze({ready:missing.length===0,missing});}
export function createMigrationStep({from,to,forward,rollback}={}){return Object.freeze({from,to,forward,rollback});}
