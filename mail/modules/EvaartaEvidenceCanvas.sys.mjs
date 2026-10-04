/* MPL-2.0 */
export const CanvasNodeKind=Object.freeze({EVIDENCE:"evidence",NOTE:"note",CLAIM:"claim",FINDING:"finding",DECISION:"decision",TASK:"task",DOCUMENT:"document"});
function uid(){return "canvas-"+(globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2));}
export function createCanvas({id=null,title="Evidence Workspace",zoom=1,pan={x:0,y:0}}={}){return {id:id||uid(),title,zoom,pan,nodes:[],edges:[],version:1,updatedAt:new Date().toISOString()};}
export function addCanvasNode(canvas,{entityId,kind,x=0,y=0,w=280,h=160,collapsed=false}={}){
 if(!entityId)throw new TypeError("entityId required"); if(!Object.values(CanvasNodeKind).includes(kind))throw new TypeError("unsupported canvas node");
 if(!canvas.nodes.some(n=>n.entityId===entityId))canvas.nodes.push({id:uid(),entityId,kind,x,y,w,h,collapsed});
 canvas.updatedAt=new Date().toISOString();return canvas;
}
export function connectCanvasNodes(canvas,fromEntityId,toEntityId,kind="relates-to"){
 if(!canvas.nodes.some(n=>n.entityId===fromEntityId)||!canvas.nodes.some(n=>n.entityId===toEntityId))throw new TypeError("canvas endpoints missing");
 if(!canvas.edges.some(e=>e.fromEntityId===fromEntityId&&e.toEntityId===toEntityId&&e.kind===kind))canvas.edges.push({id:uid(),fromEntityId,toEntityId,kind});
 canvas.updatedAt=new Date().toISOString();return canvas;
}
export function layoutCanvas(canvas){const nodes=canvas.nodes;const cols=Math.max(1,Math.ceil(Math.sqrt(nodes.length)));nodes.forEach((n,i)=>{n.x=(i%cols)*320;n.y=Math.floor(i/cols)*200;});canvas.updatedAt=new Date().toISOString();return canvas;}
export function serializeCanvas(canvas){return JSON.stringify(canvas,null,2);}
