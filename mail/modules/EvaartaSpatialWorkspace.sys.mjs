/* MPL-2.0 */
const EDGE_TYPES = new Set(["relates-to","supports","contradicts","derived-from","references","depends-on"]);
export function createCanvasState({id="workspace",revision=1}={}) {
  return {schema:"evaarta.canvas.v1",id,revision,nodes:[],edges:[],viewport:{x:0,y:0,scale:1}};
}
export function addCanvasNode(canvas,node) {
  if (!node?.id) throw new TypeError("node.id is required");
  if (canvas.nodes.some(n=>n.id===node.id)) return canvas;
  canvas.nodes.push({id:node.id,type:node.type||"evidence",x:Number(node.x)||0,y:Number(node.y)||0,w:Number(node.w)||240,h:Number(node.h)||120,sourceId:node.sourceId||null});
  return canvas;
}
export function connectCanvasNodes(canvas,edge) {
  if (!EDGE_TYPES.has(edge.type)) throw new RangeError("unsupported edge type");
  if (!canvas.nodes.some(n=>n.id===edge.from) || !canvas.nodes.some(n=>n.id===edge.to)) throw new RangeError("edge endpoint missing");
  if (edge.from===edge.to) throw new RangeError("self edge is not allowed");
  const key=edge.id||`${edge.from}:${edge.type}:${edge.to}`;
  if (!canvas.edges.some(e=>e.id===key)) canvas.edges.push({id:key,from:edge.from,to:edge.to,type:edge.type});
  return canvas;
}
export function moveCanvasNodes(canvas,ids,dx,dy) {
  const set=new Set(ids); for (const n of canvas.nodes) if(set.has(n.id)){n.x+=Number(dx)||0;n.y+=Number(dy)||0;} return canvas;
}
export function semanticZoom(canvas,scale,origin={x:0,y:0}) {
  const next=Math.min(8,Math.max(.1,Number(scale)||1)), ratio=next/canvas.viewport.scale;
  for(const n of canvas.nodes){n.x=origin.x+(n.x-origin.x)*ratio;n.y=origin.y+(n.y-origin.y)*ratio;}
  canvas.viewport={...canvas.viewport,scale:next}; return canvas;
}
export function validateCanvas(canvas) {
  const ids=new Set(canvas.nodes.map(n=>n.id));
  return canvas.schema==="evaarta.canvas.v1" && canvas.nodes.every(n=>ids.has(n.id)) &&
    canvas.edges.every(e=>ids.has(e.from)&&ids.has(e.to)&&EDGE_TYPES.has(e.type));
}
