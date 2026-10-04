/* MPL-2.0 */
export const SOURCE_FORMAT=Object.freeze({THUNDERBIRD:"thunderbird",OUTLOOK:"outlook",APPLE_MAIL:"apple-mail",GMAIL:"gmail",ZOTERO:"zotero",OBSIDIAN:"obsidian",DEVONTHINK:"devonthink",LIQUIDTEXT:"liquidtext"});
export function createMigrationPlan({source,items=[],target="evaarta"}={}){return Object.freeze({source,target,items:[...items],preserveIds:true,preserveProvenance:true,lossPolicy:"explicit-report"});}
export function migrationItem({sourceId,targetType,status="planned",warnings=[],provenance=[]}={}){return Object.freeze({sourceId,targetType,status,warnings:[...warnings],provenance:[...provenance]});}
export function migrationReport({source,items=[]}={}){const warnings=items.flatMap(x=>x.warnings||[]);return Object.freeze({source,total:items.length,warnings,lossless:warnings.length===0});}
