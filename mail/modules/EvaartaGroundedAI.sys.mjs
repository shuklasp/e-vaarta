/* MPL-2.0 */
export function buildGroundedAnswer({answer,claims=[],evidence=[]}={}){
  const evidenceIds=new Set(evidence.map(e=>e.id)); const grounded=claims.every(c=>(c.evidenceIds||[]).every(id=>evidenceIds.has(id)));
  return {schema:"evaarta.grounded-answer.v1",answer:String(answer||""),claims:claims.map(c=>({...c,evidenceIds:[...(c.evidenceIds||[])]})),evidence:evidence.map(e=>({id:e.id,sourceId:e.sourceId||null,anchor:e.anchor||null})),grounded};
}
export function unsupportedClaims(result){return (result.claims||[]).filter(c=>!(c.evidenceIds||[]).length);}
export function agentPermission(capabilities,requested){const allowed=new Set(capabilities||[]);return requested.every(x=>allowed.has(x));}
