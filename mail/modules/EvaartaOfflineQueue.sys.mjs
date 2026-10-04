/* MPL-2.0 */
export function enqueue(queue,operation,payload){return[...(queue||[]),{id:crypto.randomUUID(),operation,payload,attempts:0,createdAt:new Date().toISOString()}];}
export function dequeue(queue){const [head,...rest]=queue||[];return{head:head||null,queue:rest};}
export function markRetry(job,error){return{...job,attempts:Number(job.attempts||0)+1,lastError:String(error||"unknown"),updatedAt:new Date().toISOString()};}