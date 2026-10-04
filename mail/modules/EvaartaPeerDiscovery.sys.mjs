/* MPL-2.0 */
export class EvaartaPeerDiscovery { constructor(providers=[]){this.providers=providers;} async discover(){const out=[];for(const p of this.providers){if(p.isAvailable?.())out.push(...(await p.discover()));}return out;}}
export const peerRecord=({peerId,transport,identityHint=null,expiresAt=null})=>({peerId,transport,identityHint,expiresAt});
