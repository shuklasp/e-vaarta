/* MPL-2.0 */
export const WORKSPACE_ROUTE=Object.freeze({INBOX:"inbox",CONVERSATION:"conversation",PERSON:"person",DOCUMENT:"document",EVIDENCE:"evidence",MEETING:"meeting",DECISION:"decision",TASK:"task",PROJECT:"project",REPORT:"report",CITATION:"citation"});
export const WORKSPACE_SURFACE=Object.freeze({NAVIGATION:"navigation",LIST:"list",DETAIL:"detail",INSPECTOR:"inspector",ACTIVITY:"activity"});
export function createWorkspaceShell({id="evaarta",route=WORKSPACE_ROUTE.INBOX,selection=null,offline=true}={}){return Object.freeze({id,route,selection,offline,surfaces:Object.values(WORKSPACE_SURFACE),routes:Object.values(WORKSPACE_ROUTE)});}
export function navigateWorkspace(shell,route,selection=null){if(!shell.routes.includes(route)) throw new RangeError("unsupported workspace route");return Object.freeze({...shell,route,selection});}
export function createProjection({route,items=[],query=null,sort=null,filters=[]}={}){return Object.freeze({route,items:[...items],query,sort,filters:[...filters]});}
export function workspaceCommand({id,label,route,capability=null,requiresAuthorization=false}={}){return Object.freeze({id,label,route,capability,requiresAuthorization});}
export function semanticBreadcrumb(nodes=[]){return nodes.map(n=>({id:n.id,type:n.type,title:n.title||n.id}));}
export function workspaceContract(){return Object.freeze({entry:WORKSPACE_ROUTE.INBOX,semanticFlow:["communication","document","evidence","claim","finding","decision","task","project","report","citation","communication"],offlineFirst:true,authorizationForConsequentialActions:true});}
