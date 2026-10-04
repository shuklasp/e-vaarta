/* MPL-2.0 */
const CASES=["workspace-navigation","semantic-breadcrumbs","inbox-to-conversation","conversation-to-person","message-to-document","document-to-evidence","evidence-to-decision","decision-to-task","task-to-project","project-to-report","report-to-citation","citation-to-communication","offline-projection","authorization-gate","identity-resolution","attachment-dedupe","sync-gap","sync-conflict","ai-grounding","migration-loss-report","governance-retention","release-readiness","accessibility-navigation"];
export function workspaceShellBenchmark(){return CASES.map(id=>({id,required:true}));}
export function workspaceShellPassed(results=[]){const byId=new Map(results.map(r=>[r.id,r]));return CASES.every(id=>byId.get(id)?.pass===true);}
