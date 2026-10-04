/* MPL-2.0 */
export class EvaartaTransportSelector {
 constructor({registry,policy}){this.registry=registry;this.policy=policy;}
 select({peer,requiredCapabilities=[],preferred=[]}){
  const available=this.registry.list?.()??[];
  const ordered=[...preferred,...available].filter((x,i,a)=>a.indexOf(x)===i);
  for(const transport of ordered){
   if(this.policy?.allows?.({transport,peer,requiredCapabilities})!==false) return transport;
  }
  throw new Error("no permitted e-Vaarta transport available");
 }
}
