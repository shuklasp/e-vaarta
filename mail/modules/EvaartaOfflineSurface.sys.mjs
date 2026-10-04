/* MPL-2.0 */
export function createOfflineSurface(queue){ return {queue,pending:queue?.size?.()??0,status:"offline-ready"}; }
export function enqueueOffline(queue,operation){ if(!queue||typeof queue.enqueue!=="function") throw new TypeError("queue is required"); return queue.enqueue(operation); }