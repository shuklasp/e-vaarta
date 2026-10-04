/* MPL-2.0 */
const enc=new TextEncoder(),dec=new TextDecoder();
export function encodeWire(value){return enc.encode(JSON.stringify(value));}
export function decodeWire(bytes){return JSON.parse(dec.decode(bytes));}
export function encodeBase64(bytes){let s="";for(const b of bytes)s+=String.fromCharCode(b);return btoa(s);}
export function decodeBase64(value){const s=atob(value),out=new Uint8Array(s.length);for(let i=0;i<s.length;i++)out[i]=s.charCodeAt(i);return out;}
