/* MPL-2.0 */
export const EVENT_TYPES=["project.created","task.created","task.assigned","task.delegated","task.accepted","task.started","task.completed","comment.added","attachment.added","member.invited","member.revoked","task.reopened"];
export function createEvent({eventId,projectId,actorId,type,payload,parentIds=[],sequence=0,timestamp=new Date().toISOString()}={}){if(!EVENT_TYPES.includes(type))throw new TypeError("unsupported event type");return {version:1,eventId,projectId,actorId,type,payload,parentIds:[...parentIds],sequence,timestamp};}
export function eventKey(e){return e.eventId;}
