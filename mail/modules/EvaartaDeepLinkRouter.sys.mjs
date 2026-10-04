/* MPL-2.0 */
const ALLOWED=new Set(["workspace","document","evidence","claim","finding","decision","task","project"]);
export function parseDeepLink(value){const u=new URL(value);if(u.protocol!=="evaarta:")throw new Error("unsupported scheme");const type=u.hostname;if(!ALLOWED.has(type))throw new Error("unsupported deep-link type");const id=decodeURIComponent(u.pathname.replace(/^\//,""));if(!id)throw new Error("missing target");return {type,id,query:Object.fromEntries(u.searchParams)};}
