/* Task & Work Management 2.0 benchmark contracts. */
export const TaskBenchmark = Object.freeze([
 "create-task","subtask","assignment","assignment-acceptance","load-balancing","skill-matching",
 "capacity","workload","deadline-risk","dependency-impact","critical-path","kanban","list",
 "calendar","timeline","gantt","recurrence","checklist-promotion","time-tracking","activity-stream",
 "stalled-detection","overdue-detection","blocked-detection","escalation","sla","risk","decision-to-task",
 "evidence-to-task","offline-restart","concurrent-edit","recovery","accessibility","large-project-performance"
]);
export function createTaskBenchmarkResult({taskId,metric,value,target,passed,evidence=[]}={}) {
 return Object.freeze({taskId,metric,value,target,passed:Boolean(passed),evidence:[...evidence]});
}
export function taskBenchmarkPassed(results) {
 return Array.isArray(results)&&TaskBenchmark.every(id=>results.some(r=>r.taskId===id&&r.passed));
}
