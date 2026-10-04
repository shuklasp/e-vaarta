/* e-Vaarta Task & Work Management 2.0 — semantic work layer. */
export const TASK_STATUS = Object.freeze(["inbox","planned","ready","assigned","accepted","in-progress","waiting","blocked","review","approved","done","cancelled","deferred","rejected","duplicate"]);
export const PRIORITY = Object.freeze(["none","low","medium","high","urgent","critical"]);
export const ASSIGNMENT_MODE = Object.freeze(["direct","team","role","round-robin","load-balanced","skill-based","ai-assisted"]);
export const HEALTH = Object.freeze(["on-track","at-risk","late","blocked","stalled","unassigned","unaccepted"]);
export const EVENT = Object.freeze(["created","assigned","accepted","declined","status-changed","due-date-changed","dependency-added","dependency-removed","blocked","unblocked","commented","evidence-linked","decision-linked","estimate-changed","time-logged","escalated","completed","reopened"]);

const arr = x => Array.isArray(x) ? [...x] : [];
const now = () => new Date().toISOString();

export function createTask(input={}) {
  if (!input.id || !input.title) throw new TypeError("task id/title required");
  const t = {
    id: input.id, title: input.title, description: input.description ?? "",
    status: TASK_STATUS.includes(input.status) ? input.status : "inbox",
    priority: PRIORITY.includes(input.priority) ? input.priority : "medium",
    type: input.type ?? "task", creatorId: input.creatorId ?? null,
    projectId: input.projectId ?? null, parentId: input.parentId ?? null,
    assigneeId: input.assigneeId ?? null, assigneeTeamId: input.assigneeTeamId ?? null,
    followers: arr(input.followers), labels: arr(input.labels), customFields: {...(input.customFields||{})},
    dependsOn: arr(input.dependsOn), startAt: input.startAt ?? null, dueAt: input.dueAt ?? null,
    estimateMinutes: Number(input.estimateMinutes)||0, actualMinutes: Number(input.actualMinutes)||0,
    remainingMinutes: Number(input.remainingMinutes) || Number(input.estimateMinutes)||0,
    progress: Math.max(0,Math.min(100,Number(input.progress)||0)),
    recurrence: input.recurrence ?? null, checklist: arr(input.checklist),
    evidenceIds: arr(input.evidenceIds), decisionIds: arr(input.decisionIds), sourceIds: arr(input.sourceIds),
    skills: arr(input.skills), resources: arr(input.resources), risks: arr(input.risks),
    approvals: arr(input.approvals), comments: arr(input.comments), attachments: arr(input.attachments),
    timeEntries: arr(input.timeEntries), sla: input.sla ?? null,
    createdAt: input.createdAt ?? now(), updatedAt: input.updatedAt ?? now(),
    version: Number(input.version)||1
  };
  return Object.freeze(t);
}

export function assignTask(task, assignment={}) {
  if (!task?.id) throw new TypeError("task required");
  const a = {mode: assignment.mode ?? "direct", assigneeId: assignment.assigneeId ?? null, teamId: assignment.teamId ?? null,
    role: assignment.role ?? null, rationale: assignment.rationale ?? null, alternatives: arr(assignment.alternatives),
    assignedAt: assignment.assignedAt ?? now(), acceptedAt: null, state:"pending"};
  return {...task, assigneeId:a.assigneeId, assigneeTeamId:a.teamId, status:a.assigneeId||a.teamId?"assigned":task.status, assignment:a, updatedAt:now(), version:task.version+1};
}
export function acceptAssignment(task, accepted=true, reason=null) {
  if (!task?.assignment) throw new TypeError("assignment required");
  return {...task, status:accepted?"accepted":"rejected", assignment:{...task.assignment,state:accepted?"accepted":"declined",acceptedAt:accepted?now():null,reason}, updatedAt:now(), version:task.version+1};
}
export function addDependency(task, dependencyId) {
  if (!dependencyId || dependencyId===task.id) throw new TypeError("valid dependency required");
  return {...task, dependsOn:[...new Set([...arr(task.dependsOn),dependencyId])],updatedAt:now(),version:task.version+1};
}
export function validateTaskGraph(tasks) {
  const byId=new Map(tasks.map(t=>[t.id,t])), visiting=new Set(), visited=new Set();
  const dfs=id=>{if(visiting.has(id))return false;if(visited.has(id))return true;const t=byId.get(id);if(!t)return false;visiting.add(id);for(const d of arr(t.dependsOn))if(!dfs(d))return false;visiting.delete(id);visited.add(id);return true};
  return tasks.every(t=>dfs(t.id));
}
export function criticalPath(tasks) {
  if(!validateTaskGraph(tasks)) throw new Error("cyclic or missing dependency graph");
  const byId=new Map(tasks.map(t=>[t.id,t])), memo=new Map();
  const len=id=>{if(memo.has(id))return memo.get(id);const t=byId.get(id);const v=(Number(t?.durationMinutes)||Number(t?.estimateMinutes)||1)+Math.max(0,...arr(t?.dependsOn).map(len));memo.set(id,v);return v};
  return tasks.map(t=>({...t,pathLengthMinutes:len(t.id)})).sort((a,b)=>b.pathLengthMinutes-a.pathLengthMinutes);
}
export function capacityWindow({capacityMinutes=0,committedMinutes=0,availableMinutes=capacityMinutes}={}) {
  const available=Math.max(0,Number(availableMinutes)||0), committed=Math.max(0,Number(committedMinutes)||0);
  return {capacityMinutes:Number(capacityMinutes)||0,committedMinutes:committed,availableMinutes:available,utilization:available?committed/available:0,overloaded:committed>available};
}
export function scheduleTask(task,{capacityMinutes=480,calendarFactor=1}={}) {
  const effort=Math.max(0,Number(task.remainingMinutes)||Number(task.estimateMinutes)||0), capacity=Math.max(1,capacityMinutes*calendarFactor);
  const days=Math.ceil(effort/capacity);
  return {...task,scheduledEffortMinutes:effort,scheduledDays:days,onTrack:!task.dueAt||days>=0};
}
export function monitorTask(task, context={}) {
  const due=task.dueAt ? Date.parse(task.dueAt) : null, t=context.now ? Date.parse(context.now) : Date.now();
  const staleAfter=Number(context.staleAfterHours)||72, last=task.updatedAt?Date.parse(task.updatedAt):t;
  const stale=(t-last)>=staleAfter*3600000 && !["done","cancelled"].includes(task.status);
  let health="on-track";
  if(!task.assigneeId&&!task.assigneeTeamId) health="unassigned";
  else if(task.assignment?.state==="pending") health="unaccepted";
  else if(task.status==="blocked") health="blocked";
  else if(stale) health="stalled";
  else if(due && t>due && task.status!=="done") health="late";
  else if(due && due-t<Number(context.warningHours||24)*3600000) health="at-risk";
  return {health,stalled:stale,overdue:!!due&&t>due&&task.status!=="done",unassigned:!task.assigneeId&&!task.assigneeTeamId,dependencyRisk:!!context.dependencyRisk};
}
export function createEscalationPolicy(input={}) {
  return {id:input.id||"policy-"+Date.now(), stages:arr(input.stages).map((s,i)=>({...s,order:s.order??i+1})), businessHours:input.businessHours??null, pauseWhen:arr(input.pauseWhen), audit:true};
}
export function evaluateEscalation(task, health, policy) {
  if(!policy) return [];
  return arr(policy.stages).filter(s=>s.health===health || s.trigger===health).map(s=>({stage:s.order,action:s.action,recipient:s.recipient,reason:health,taskId:task.id,at:now()}));
}
export function createSla(input={}) { return {responseMinutes:Number(input.responseMinutes)||0,resolutionMinutes:Number(input.resolutionMinutes)||0,businessCalendar:input.businessCalendar??null,pauseStates:arr(input.pauseStates),warningPercent:Number(input.warningPercent)||80}; }
export function evaluateSla(task, sla, elapsedMinutes) {
  if(!sla) return {status:"none"};
  const limit=sla.resolutionMinutes||0, pct=limit?elapsedMinutes/limit*100:0;
  return {status:limit&&elapsedMinutes>limit?"breached":pct>=sla.warningPercent?"at-risk":"on-track",elapsedMinutes,limitMinutes:limit,pct};
}
export function logTime(task, entry={}) {
  const minutes=Math.max(0,Number(entry.minutes)||0), e={id:entry.id||"time-"+Date.now(),minutes,userId:entry.userId??null,startedAt:entry.startedAt??now(),note:entry.note??""};
  return {...task,timeEntries:[...arr(task.timeEntries),e],actualMinutes:Number(task.actualMinutes||0)+minutes,remainingMinutes:Math.max(0,Number(task.remainingMinutes||0)-minutes),updatedAt:now(),version:task.version+1};
}
export function createRecurringTask(task, recurrence) { return {...task,recurrence:{...recurrence},updatedAt:now(),version:task.version+1}; }
export function generateRecurrence(task, count=1) {
  const r=task.recurrence;if(!r||!Number.isInteger(count)||count<1) return [];
  return Array.from({length:count},(_,i)=>({...task,id:`${task.id}#${i+1}`,parentRecurringId:task.id,status:"planned",createdAt:now(),updatedAt:now()}));
}
export function taskActivity(task,event,details={}) {
  return {id:"activity-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),taskId:task.id,event,details,at:now()};
}
export function projectHealth(tasks, context={}) {
  const monitored=tasks.map(t=>({task:t,...monitorTask(t,context)}));
  const counts=Object.fromEntries(HEALTH.map(h=>[h,monitored.filter(x=>x.health===h).length]));
  return {health:counts.blocked||counts.late?"at-risk":counts.stalled||counts.unassigned||counts.unaccepted?"watch":"on-track",counts};
}
export function workload(tasks, people=[], {windowStart=null,windowEnd=null}={}) {
  return people.map(p=>{const xs=tasks.filter(t=>t.assigneeId===p.id);const committed=xs.reduce((n,t)=>n+Number(t.remainingMinutes||t.estimateMinutes||0),0);const cap=Number(p.capacityMinutes)||0;return {...p,tasks:xs.map(t=>t.id),committedMinutes:committed,availableMinutes:Math.max(0,cap-committed),utilization:cap?committed/cap:0,overloaded:cap>0&&committed>cap,windowStart,windowEnd};});
}
export const taskWorkManagementContract = Object.freeze({
  taskLifecycle:true,assignment:true,acceptance:true,capacity:true,scheduling:true,dependencies:true,monitoring:true,
  stalledDetection:true,escalation:true,sla:true,recurrence:true,checklists:true,timeTracking:true,activity:true,
  workload:true,projectHealth:true,evidenceTraceability:true,decisionTraceability:true,offlineFirst:true
});
