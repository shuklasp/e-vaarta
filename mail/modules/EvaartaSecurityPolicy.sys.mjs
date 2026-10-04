/* MPL-2.0 */
export const Capability=Object.freeze({READ:"project.read",WRITE:"project.write",EVIDENCE_READ:"evidence.read",EVIDENCE_WRITE:"evidence.write",TASK_ASSIGN:"task.assign",EXPORT:"document.export",ADMIN:"project.admin"});
export function createSecurityPolicy({defaultCapabilities=[Capability.READ],members=[]}={}){return{version:1,defaultCapabilities,members};}
export function can(policy,peerId,capability){const member=(policy.members||[]).find(m=>m.peerId===peerId);return (member?.revoked===false&&member.capabilities?.includes(capability))||(!member&&policy.defaultCapabilities.includes(capability));}
export function revokeMember(policy,peerId,reason=null){const member=(policy.members||[]).find(m=>m.peerId===peerId);if(member){member.revoked=true;member.revokedAt=new Date().toISOString();member.reason=reason;}return policy;}
