/* MPL-2.0 */
export function messageToEvidence({messageId,sourceIds=[]}={}){return Object.freeze({messageId,sourceIds:[...sourceIds],stage:"evidence"});}
export function evidenceToDecision({evidenceIds=[],decisionId}={}){return Object.freeze({evidenceIds:[...evidenceIds],decisionId,stage:"decision"});}
export function decisionToTask({decisionId,taskId,owner=null}={}){return Object.freeze({decisionId,taskId,owner,stage:"task"});}
export function taskToProject({taskId,projectId}={}){return Object.freeze({taskId,projectId,stage:"project"});}
export function actionTrace({messageId,evidenceIds=[],decisionId=null,taskId=null,projectId=null}={}){return Object.freeze({messageId,evidenceIds:[...evidenceIds],decisionId,taskId,projectId});}
