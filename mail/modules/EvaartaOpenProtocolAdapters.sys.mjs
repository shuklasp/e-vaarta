/* MPL-2.0 */
import {createCapabilityGatedTransport} from "./EvaartaTransportAdapters.sys.mjs";
export const createMatrixTransport=impl=>createCapabilityGatedTransport({id:"matrix",capability:"official-matrix-api",send:impl?.send,available:impl?.isAvailable});
export const createXMPPTransport=impl=>createCapabilityGatedTransport({id:"xmpp",capability:"official-xmpp-api",send:impl?.send,available:impl?.isAvailable});
export const createGenericMessengerTransport=(id,capability,impl)=>createCapabilityGatedTransport({id,capability,send:impl?.send,available:impl?.isAvailable});
