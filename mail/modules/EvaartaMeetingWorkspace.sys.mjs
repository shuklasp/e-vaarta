/* MPL-2.0 */
export function createMeetingWorkspace({meetingId,title,start,end,attendees=[],sourceIds=[],conversationIds=[]}={}){return Object.freeze({meetingId,title,start,end,attendees:[...attendees],sourceIds:[...sourceIds],conversationIds:[...conversationIds],agenda:[],notes:[],decisions:[],actions:[]});}
export function addMeetingDecision(workspace,{id,text,sourceIds=[]}={}){return Object.freeze({...workspace,decisions:[...workspace.decisions,{id,text,sourceIds:[...sourceIds]}]});}
export function addMeetingAction(workspace,{taskId,text,owner=null,sourceIds=[]}={}){return Object.freeze({...workspace,actions:[...workspace.actions,{taskId,text,owner,sourceIds:[...sourceIds]}]});}
export function meetingTrace(workspace){return Object.freeze({meetingId:workspace.meetingId,sourceIds:[...workspace.sourceIds],conversationIds:[...workspace.conversationIds],decisions:workspace.decisions.map(x=>x.id),actions:workspace.actions.map(x=>x.taskId)});}
