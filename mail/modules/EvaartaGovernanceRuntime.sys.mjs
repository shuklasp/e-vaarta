/* MPL-2.0 */
export const GOVERNANCE_DECISION=Object.freeze({ALLOW:"allow",DENY:"deny",REVIEW:"review",HOLD:"hold"});
export function evaluateGovernance({classification="normal",role="user",action,legalHold=false,retentionExpired=false}={}){if(legalHold)return Object.freeze({decision:GOVERNANCE_DECISION.HOLD,reason:"legal-hold"});if(retentionExpired&&action==="delete")return Object.freeze({decision:GOVERNANCE_DECISION.REVIEW,reason:"retention-policy"});if(classification==="restricted"&&role!=="admin")return Object.freeze({decision:GOVERNANCE_DECISION.DENY,reason:"restricted-role"});return Object.freeze({decision:GOVERNANCE_DECISION.ALLOW,reason:"policy"});}
export function createRetentionPolicy({name,days=null,legalHold=false,classification="normal"}={}){return Object.freeze({name,days,legalHold,classification});}
export function createAuditEvent({actor,action,resource,result,reason=null}={}){return Object.freeze({actor,action,resource,result,reason,at:new Date().toISOString()});}
