/* Phase F benchmark contract. */
export const PHASE_F_BENCHMARKS=Object.freeze(["work-graph","my-work","kanban","list","calendar","timeline","gantt","critical-path","assignment-engine","assignment-negotiation","capacity","workload","scheduling","what-if","project-command-center","portfolio","risk","workflow-builder","notifications","evidence-verification","offline-events","conflict-review","grounded-project-control","weekly-review"]);
export function createPhaseFResult(id,passed,details={}){if(!PHASE_F_BENCHMARKS.includes(id))throw new RangeError("unknown Phase F benchmark");return {id,passed:Boolean(passed),details};}
export function phaseFPassed(results=[]){const m=new Map(results.map(r=>[r.id,r]));return PHASE_F_BENCHMARKS.every(id=>m.get(id)?.passed===true);}
