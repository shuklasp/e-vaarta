/* MPL-2.0 */
export const CAPABILITIES=["project.read","project.write","task.create","task.assign","task.delegate","task.complete","comment.write","attachment.read","attachment.write","project.invite","project.export"];
export function createCapability({id,projectId,subject,actions=[],expiresAt=null,issuer}={}){const allowed=actions.filter(a=>CAPABILITIES.includes(a));return {version:1,id,projectId,subject,actions:[...new Set(allowed)],expiresAt,issuer};}
export function allows(capability,action,now=Date.now()){return !!capability&&capability.actions.includes(action)&&(!capability.expiresAt||Date.parse(capability.expiresAt)>=now);}
