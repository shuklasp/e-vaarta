/* MPL-2.0 */
const STATUSES=["backlog","todo","in-progress","blocked","done","cancelled"];
export function createTask(task){if(!task?.id||!task.title)throw new TypeError("task id/title required");return {...task,status:STATUSES.includes(task.status)?task.status:"todo",dependsOn:[...(task.dependsOn||[])]};}
export function validateTaskGraph(tasks){
  const byId=new Map(tasks.map(t=>[t.id,t])); const visiting=new Set(),visited=new Set();
  function dfs(id){if(visiting.has(id))return false;if(visited.has(id))return true;visiting.add(id);const t=byId.get(id);if(!t){visiting.delete(id);return false;}for(const d of t.dependsOn)if(!dfs(d))return false;visiting.delete(id);visited.add(id);return true;}
  return tasks.every(t=>dfs(t.id));
}
export function criticalPath(tasks){
  const byId=new Map(tasks.map(t=>[t.id,t])),memo=new Map();
  function len(id){if(memo.has(id))return memo.get(id);const t=byId.get(id);if(!t)return 0;const v=(Number(t.duration)||1)+Math.max(0,...t.dependsOn.map(len));memo.set(id,v);return v;}
  return tasks.map(t=>({...t,pathLength:len(t.id)})).sort((a,b)=>b.pathLength-a.pathLength);
}
export function projectStatus(tasks){if(!tasks.length)return "empty";if(tasks.every(t=>t.status==="done"))return "done";if(tasks.some(t=>t.status==="blocked"))return "blocked";if(tasks.some(t=>t.status==="in-progress"))return "active";return "planned";}
