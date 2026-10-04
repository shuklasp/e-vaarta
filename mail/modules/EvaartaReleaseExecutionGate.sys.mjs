/* MPL-2.0 */
export const GATE=Object.freeze({SOURCE:"source",BUILD:"build",UNIT:"unit",INTEGRATION:"integration",PROVIDER:"provider",DEVICE:"device",SECURITY:"security",ACCESSIBILITY:"accessibility",PERFORMANCE:"performance"});
export function createExecutionGate({id,kind,required=true,evidence=[]}={}){return Object.freeze({id,kind,required,evidence:[...evidence]});}
export function evaluateExecutionGates(gates=[]){const missing=gates.filter(g=>g.required&&(!g.evidence||g.evidence.length===0));return Object.freeze({ready:missing.length===0,missing:missing.map(g=>g.id)});}
export function recordExecutionEvidence({gateId,result,environment,artifact=null}={}){return Object.freeze({gateId,result,environment,artifact,recordedAt:new Date().toISOString()});}
