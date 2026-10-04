/* MPL-2.0 */
import {encodeWire,decodeWire,encodeBase64,decodeBase64} from "./EvaartaWireCodec.sys.mjs";
export async function sealPayload(payload,{crypto,key,nonceFactory}) {
 if(!crypto?.encrypt) throw new Error("encryption provider unavailable");
 const nonce=await nonceFactory();
 const plaintext=encodeWire(payload);
 const ciphertext=await crypto.encrypt(plaintext,key,nonce);
 return {version:1,nonce:encodeBase64(nonce),ciphertext:encodeBase64(ciphertext)};
}
export async function openPayload(box,{crypto,key}) {
 if(box?.version!==1) throw new Error("unsupported encrypted payload");
 const plaintext=await crypto.decrypt(decodeBase64(box.ciphertext),key,decodeBase64(box.nonce));
 return decodeWire(plaintext);
}
