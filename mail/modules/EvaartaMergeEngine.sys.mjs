/* MPL-2.0 */
export function compareManifests(local=[],remote=[]){const l=new Set(local),r=new Set(remote);return {needFromRemote:remote.filter(x=>!l.has(x)),needFromLocal:local.filter(x=>!r.has(x)),common:remote.filter(x=>l.has(x))};}
export function mergeEvents(journal,events=[]){const accepted=[];for(const e of events){if(journal.append(e))accepted.push(e.eventId);}return {accepted,manifest:journal.manifest()};}
export function detectConflicts(events=[]){const byTask=new Map();for(const e of events){const id=e.payload?.taskId;if(!id)continue;(byTask.get(id)||byTask.set(id,[]).get(id)).push(e);}return [...byTask].filter(([,xs])=>xs.length>1&&new Set(xs.map(x=>x.type)).size>1).map(([taskId,xs])=>({taskId,eventIds:xs.map(x=>x.eventId)}));}
