/* MPL-2.0 */
export const ExtractionKind=Object.freeze({HEADING:"heading",PARAGRAPH:"paragraph",TABLE:"table",FIGURE:"figure",ENTITY:"entity",CLAIM:"claim",DATE:"date",CITATION:"citation"});
export function createExtraction({documentId,revisionId=null,kind,value,confidence=0.5,page=null,anchor=null,source="local"}={}){return {id:"extract-"+(globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)),documentId,revisionId,kind,value,confidence,page,anchor,source,createdAt:new Date().toISOString()};}
export function groupExtractions(extractions){return Object.groupBy?Object.groupBy(extractions,x=>x.kind):extractions.reduce((m,x)=>((m[x.kind]??=[]).push(x),m),{});}
export function qualityScore({confidence=0,hasSource=false,hasAnchor=false,isContradicted=false}={}){return Math.max(0,Math.min(1,Number(confidence)*0.5+(hasSource?0.2:0)+(hasAnchor?0.2:0)-(isContradicted?0.2:0)));}
