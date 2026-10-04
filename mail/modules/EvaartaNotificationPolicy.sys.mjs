/* MPL-2.0 */
export const NOTIFICATION_PRIORITY=Object.freeze({CRITICAL:4,HIGH:3,NORMAL:2,LOW:1});
export function createNotificationRule({id,match={},channel="in-app",priority=NOTIFICATION_PRIORITY.NORMAL,quietHours=null,batchMinutes=0,dedupeKey=null,escalateAfter=null}={}){return Object.freeze({id,match,channel,priority,quietHours,batchMinutes,dedupeKey,escalateAfter});}
export function evaluateNotification(rule,event,{now=new Date()}={}){const matches=Object.entries(rule.match).every(([k,v])=>event?.[k]===v);if(!matches)return Object.freeze({deliver:false,reason:"no-match"});if(rule.quietHours)return Object.freeze({deliver:false,reason:"quiet-hours"});return Object.freeze({deliver:true,channel:rule.channel,priority:rule.priority,batchMinutes:rule.batchMinutes,dedupeKey:rule.dedupeKey});}
export function notificationDedupe(events=[]){const seen=new Set();return events.filter(e=>{const k=e.dedupeKey||e.id;if(seen.has(k))return false;seen.add(k);return true;});}
