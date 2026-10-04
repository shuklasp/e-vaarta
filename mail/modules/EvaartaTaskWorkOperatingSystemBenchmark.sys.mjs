/* Phases A-E task/work benchmark contracts. */
export const TaskWorkOperatingSystemBenchmark=Object.freeze([
"my-work","task-workspace","kanban","list","calendar","timeline","gantt","dependencies","checklists","recurrence","time-tracking",
"assignment-scoring","assignment-negotiation","capacity","workload","scheduling","predictive-deadlines","team-command-center","project-command-center",
"portfolio","risk","escalation","sla","decision-to-task","evidence-to-task","evidence-completion","verification","impact-analysis","evidence-reporting",
"assignment-ai","schedule-optimization","stalled-reasoning","risk-prediction","grounded-project-control","weekly-review","authorization-boundary","offline-execution"
]);
export function createTaskWorkBenchmarkResult({id,passed=false,metric=null,value=null,target=null,evidence=[]}={}){return Object.freeze({id,passed:Boolean(passed),metric,value,target,evidence:[...evidence]});}
export function taskWorkOperatingSystemPassed(results){return Array.isArray(results)&&TaskWorkOperatingSystemBenchmark.every(id=>results.some(r=>r.id===id&&r.passed));}
