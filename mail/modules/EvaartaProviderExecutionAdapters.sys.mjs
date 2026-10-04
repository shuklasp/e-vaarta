/* MPL-2.0 */
import { PROVIDER, OPERATION } from "./EvaartaCommunicationProvidersComplete.sys.mjs";

export const EXECUTION_MODE=Object.freeze({LOCAL:"local",NETWORK:"network",EXTERNAL:"external"});
const handlers=new Map();

export function registerProviderHandler({provider,operation,execute,mode=EXECUTION_MODE.NETWORK}={}) {
  if(!Object.values(PROVIDER).includes(provider)) throw new RangeError("unsupported provider");
  if(!Object.values(OPERATION).includes(operation)) throw new RangeError("unsupported operation");
  if(typeof execute!=="function") throw new TypeError("execute must be a function");
  handlers.set(provider+"|"+operation,{execute,mode});
  return Object.freeze({provider,operation,mode});
}
export function providerHandler(provider,operation){return handlers.get(provider+"|"+operation)||null;}
export async function executeProviderRequest(request,context={}) {
  const handler=providerHandler(request.provider,request.operation);
  if(!handler) throw new Error("provider operation is not configured");
  return handler.execute(request,context);
}
export function executionCoverage(){return [...handlers.entries()].map(([key,value])=>({key,mode:value.mode}));}
export function createUnavailableProviderResult({provider,operation,reason="runtime-provider-not-configured"}={}) {
  return Object.freeze({provider,operation,executed:false,reason});
}
