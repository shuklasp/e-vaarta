/* MPL-2.0 */
export const AI_PERMISSION=Object.freeze({READ:"read",DRAFT:"draft",ACT:"act",EXPORT:"export"});
export function createModelDescriptor({id,provider="local",version=null,capabilities=[],privacy="local"}={}){return Object.freeze({id,provider,version,capabilities:[...capabilities],privacy});}
export function createAiRequest({modelId,input,sourceIds=[],permissions=[AI_PERMISSION.READ],maxTokens=2000}={}){return Object.freeze({modelId,input,sourceIds:[...sourceIds],permissions:[...permissions],maxTokens});}
export function validateGrounding({answer="",citations=[],sourceIds=[]}={}){const cited=new Set(citations);const grounded=sourceIds.length===0||sourceIds.some(id=>cited.has(id));return Object.freeze({grounded,citations:[...citations]});}
export function authorizeAiAction(request,required){return request?.permissions?.includes(required)===true;}
