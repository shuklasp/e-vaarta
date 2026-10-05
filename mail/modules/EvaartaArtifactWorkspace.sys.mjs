/* MPL-2.0 */
export const ARTIFACT_VIEW=Object.freeze({ALL:"all",TASK:"task",DOCUMENT:"document",EVIDENCE:"evidence",COMMUNICATION:"communication",PROJECT:"project"});
export function createArtifactWorkspace({vault=null,sync=null,selection=null,view=ARTIFACT_VIEW.ALL}={}){return Object.freeze({vault,sync,selection,view,filters:{type:null,state:null,query:null}});}
export function setArtifactWorkspaceFilter(w,filters={}){return Object.freeze({...w,filters:{...w.filters,...filters}});}
export function artifactWorkspaceItems(w,artifacts=[]){const f=w.filters||{};return artifacts.filter(a=>(!f.type||a.type===f.type)&&(!f.state||a.state===f.state)&&(!f.query||String(a.title||"").toLowerCase().includes(String(f.query).toLowerCase())||String(a.contentHash||"").includes(String(f.query))));}
export function selectArtifact(w,artifactId){return Object.freeze({...w,selection:artifactId});}
export function workspaceArtifactContext({artifact,links=[],revisions=[],evidence=[],tasks=[],messages=[]}={}){return Object.freeze({artifact,links:[...links],revisions:[...revisions],evidence:[...evidence],tasks:[...tasks],messages:[...messages]});}
export function workspaceCommands(){return Object.freeze(["open","preview","search","filter","link-to-task","link-to-evidence","forward","share","history","verify","restore","export"]);}
export function artifactWorkspaceContract(){return Object.freeze({oneIdentity:true,noRawDuplication:true,relationshipAware:true,revisionAware:true,evidenceAware:true,taskAware:true,communicationAware:true,offlineFirst:true});}