/* MPL-2.0 */
export const SYNC_EVENT=Object.freeze({UPSERT:"upsert",DELETE:"delete",EDIT:"edit",REACTION:"reaction",RECEIPT:"receipt",GAP:"gap",CONFLICT:"conflict"});
export function createSyncCursor({provider,account,cursor=null}={}){return Object.freeze({provider,account,cursor});}
export function createSyncEvent({id,type,entityId,version,payload,deviceId}={}){if(!id||!entityId||!deviceId)throw new TypeError("sync event identity required");return Object.freeze({id,type,entityId,version,payload,deviceId});}
export function detectSyncGaps(events=[]){const ids=new Set(events.map(e=>e.id));return events.filter(e=>e.type===SYNC_EVENT.GAP||e.payload?.missingIds?.some(id=>!ids.has(id)));}
export function reconcileSyncEvents(local=[],remote=[]){const byId=new Map(local.map(e=>[e.id,e]));const conflicts=[];for(const e of remote){const prior=byId.get(e.id);if(prior&&JSON.stringify(prior)!==JSON.stringify(e))conflicts.push({id:e.id,type:SYNC_EVENT.CONFLICT});else byId.set(e.id,e);}return Object.freeze({events:[...byId.values()],conflicts,deterministic:true});}
