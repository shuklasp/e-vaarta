/* MPL-2.0 */
import {GraphEntityKind,GraphRelation,createGraphEntity,createGraphRelation,addGraphEntity,addGraphRelation} from "./EvaartaKnowledgeGraph.sys.mjs";
export function createProject({name,description="",ownerId=null}={}){return createGraphEntity(GraphEntityKind.PROJECT,{name:String(name||"").trim(),description,ownerId});}
export function createTask({title,description="",assigneeId=null,dueAt=null,priority="normal",status="open",dependsOn=[]}={}){return createGraphEntity(GraphEntityKind.TASK,{title:String(title||"").trim(),description,assigneeId,dueAt,priority,status,dependsOn});}
export function createDecisionTaskLink(decisionId,taskId){return createGraphRelation({fromId:decisionId,toId:taskId,kind:GraphRelation.IMPLEMENTS});}
export function createTaskDependency(taskId,dependencyId){return createGraphRelation({fromId:taskId,toId:dependencyId,kind:GraphRelation.DEPENDS_ON});}
export function addProjectObject(graph,entity){return addGraphEntity(graph,entity);}
export function linkProjectObject(graph,relation){return addGraphRelation(graph,relation);}
export function projectStatus(graph){const tasks=(graph.entities||[]).filter(e=>e.kind===GraphEntityKind.TASK);return {total:tasks.length,open:tasks.filter(t=>t.status!=="completed").length,completed:tasks.filter(t=>t.status==="completed").length,overdue:tasks.filter(t=>t.dueAt&&new Date(t.dueAt)<new Date()&&t.status!=="completed").length};}
