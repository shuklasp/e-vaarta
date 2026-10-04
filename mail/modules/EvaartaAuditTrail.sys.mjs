/* MPL-2.0 */
export function createAuditEvent({actorId,action,targetId,targetKind,reason=null,metadata={}}={}){return{id:"audit-"+(globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2)),actorId,action,targetId,targetKind,reason,metadata,createdAt:new Date().toISOString()};}
export function auditSummary(events){return{total:events.length,actors:new Set(events.map(e=>e.actorId).filter(Boolean)).size,actions:[...new Set(events.map(e=>e.action))],last:events.slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))[0]||null};}
