/* MPL-2.0 */
export class EvaartaOfflineRetryEngine {
 constructor({queue,bridge,clock=()=>Date.now(),maxAttempts=8,backoffMs=5000}){Object.assign(this,{queue,bridge,clock,maxAttempts,backoffMs});}
 async drain({transportSelector,limit=20}={}){
  const items=this.queue.list?.().slice(0,limit)??[];
  const results=[];
  for(const item of items){
   if((item.attempts??0)>=this.maxAttempts){results.push({messageId:item.messageId,status:"dead-letter"});continue;}
   try{
    const transport=await transportSelector(item);
    const result=await this.bridge.send(item.envelope,transport,item.context);
    this.queue.remove?.(item.messageId);
    results.push({messageId:item.messageId,status:"sent",transport,result});
   }catch(error){
    this.queue.update?.(item.messageId,{attempts:(item.attempts??0)+1,nextAttemptAt:this.clock()+this.backoffMs*Math.pow(2,item.attempts??0),lastError:error.message});
    results.push({messageId:item.messageId,status:"retry",reason:error.message});
   }
  }
  return results;
 }
}
