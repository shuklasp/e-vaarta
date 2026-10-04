/* MPL-2.0 */
export const EVAARTA_URL_SCHEME="evaarta";
export function createDeepLink({workspaceId,documentId=null,itemId=null}={}) {
  if(!workspaceId)throw new TypeError("workspaceId is required.");
  const url=new URL(`${EVAARTA_URL_SCHEME}://workspace/${encodeURIComponent(workspaceId)}`);
  if(documentId)url.searchParams.set("document",documentId);if(itemId)url.searchParams.set("item",itemId);return url.toString();
}
export function parseDeepLink(value){const url=new URL(value);if(url.protocol!==`${EVAARTA_URL_SCHEME}:`||url.hostname!=="workspace")return null;const workspaceId=decodeURIComponent(url.pathname.slice(1));if(!workspaceId)return null;return{workspaceId,documentId:url.searchParams.get("document"),itemId:url.searchParams.get("item")};}
