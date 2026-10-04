/* MPL-2.0 */
/**
 * e-Vaarta Communication Suite — Phases 1–7
 * Universal communications semantic model:
 * Person -> Conversation -> Message -> Channel -> Evidence -> Decision -> Task -> Project
 *
 * This module is provider-neutral. Adapters describe capabilities and translate
 * provider payloads into the canonical model; they never own semantic state.
 */

export const CHANNEL = Object.freeze({
  EMAIL:"email", SMS:"sms", RCS:"rcs", MATRIX:"matrix", TELEGRAM:"telegram",
  WHATSAPP:"whatsapp", SLACK:"slack", TEAMS:"teams", CHAT:"chat", MEETING:"meeting"
});
export const MESSAGE_STATE = Object.freeze({DRAFT:"draft",QUEUED:"queued",SENT:"sent",DELIVERED:"delivered",READ:"read",FAILED:"failed"});
export const PERSON_ROLE = Object.freeze({PERSON:"person",ORGANIZATION:"organization",TEAM:"team",BOT:"bot"});
export const SECURITY = Object.freeze({NORMAL:"normal",SENSITIVE:"sensitive",CONFIDENTIAL:"confidential",RESTRICTED:"restricted"});

const id = (prefix, value) => String(value || "").trim() || prefix + "-" + Math.random().toString(36).slice(2);
const uniq = xs => [...new Set((xs || []).filter(Boolean))];

export function createPerson({id:personId,name="",addresses=[],phones=[],organizations=[],tags=[],role=PERSON_ROLE.PERSON}={}) {
  return {schema:"evaarta.person.v1",id:id("person",personId),name,addresses:uniq(addresses),phones:uniq(phones),organizations:uniq(organizations),tags:uniq(tags),role};
}
export function resolveIdentity(identities=[], candidate={}) {
  const norm = v => String(v||"").trim().toLowerCase();
  const keys = new Set([...(candidate.addresses||[]),...(candidate.phones||[])].map(norm).filter(Boolean));
  const matches = identities.filter(p => [...(p.addresses||[]),...(p.phones||[])].map(norm).some(x=>keys.has(x)));
  return matches.length ? {person:matches[0],confidence:matches.length===1?1:.75,ambiguous:matches.length>1} : {person:null,confidence:0,ambiguous:false};
}
export function createConversation({id:conversationId,title="",participantIds=[],channel=CHANNEL.CHAT,projectId=null,tags=[],archived=false}={}) {
  return {schema:"evaarta.conversation.v1",id:id("conversation",conversationId),title,participantIds:uniq(participantIds),channel,projectId,tags:uniq(tags),archived,unreadCount:0,lastMessageAt:null};
}
export function createMessage({id:messageId,conversationId,senderId,recipientIds=[],body="",channel=CHANNEL.CHAT,threadId=null,replyToId=null,state=MESSAGE_STATE.SENT,attachmentIds=[],evidenceIds=[],timestamp=new Date().toISOString(),security=SECURITY.NORMAL,externalId=null,provider=null}={}) {
  if (!conversationId || !senderId) throw new RangeError("conversationId and senderId are required");
  return {schema:"evaarta.message.v1",id:id("message",messageId),conversationId,senderId,recipientIds:uniq(recipientIds),body:String(body),channel,threadId,replyToId,state,attachmentIds:uniq(attachmentIds),evidenceIds:uniq(evidenceIds),timestamp,security,externalId,provider};
}
export function createAttachment({id:attachmentId,messageId,documentId,name="",mime="",size=0,hash=null}={}) {
  return {schema:"evaarta.attachment.v1",id:id("attachment",attachmentId),messageId,documentId,name,mime,size,hash};
}
export function createCommunicationStore({people=[],conversations=[],messages=[],attachments=[],meetings=[],calendarEvents=[],decisions=[],tasks=[],projects=[]}={}) {
  return {schema:"evaarta.communication-store.v1",version:1,people,conversations,messages,attachments,meetings,calendarEvents,decisions,tasks,projects};
}
export function conversationMessages(store,conversationId){return store.messages.filter(m=>m.conversationId===conversationId).sort((a,b)=>String(a.timestamp).localeCompare(String(b.timestamp)));}
export function unifiedInbox(store,{personId=null,channels=null,unreadOnly=false}={}) {
  const allowed=channels?new Set(channels):null;
  return store.conversations.filter(c=>(!personId||c.participantIds.includes(personId))&&(!allowed||allowed.has(c.channel))&&(!unreadOnly||c.unreadCount>0))
    .sort((a,b)=>String(b.lastMessageAt||"").localeCompare(String(a.lastMessageAt||"")));
}
export function thread(store,conversationId,threadId=null){return conversationMessages(store,conversationId).filter(m=>threadId?m.threadId===threadId||m.id===threadId:true);}
export function searchCommunication(store,query,{channels=null,personIds=null}={}) {
  const q=String(query||"").toLowerCase(); const cs=channels?new Set(channels):null; const ps=personIds?new Set(personIds):null;
  return store.messages.filter(m=>(!cs||cs.has(m.channel))&&(!ps||ps.has(m.senderId)||m.recipientIds.some(x=>ps.has(x)))&&(m.body.toLowerCase().includes(q)||String(m.externalId||"").toLowerCase().includes(q)))
    .map(m=>({type:"message",id:m.id,score:m.body.toLowerCase().includes(q)?1:.5,message:m}));
}
export function createProviderAdapter({provider,channels=[],capabilities=[],normalizeMessage,send,receive,sync}={}) {
  if(!provider) throw new RangeError("provider is required");
  return Object.freeze({provider,channels:[...channels],capabilities:[...capabilities],normalizeMessage,send,receive,sync});
}
export function adapterCan(adapter,capability){return adapter?.capabilities?.includes(capability)===true;}
export function normalizeProviderMessage(adapter,payload){if(!adapter?.normalizeMessage)throw new Error("adapter has no normalizer");return adapter.normalizeMessage(payload);}
export function queueOutbound(store,message){return {...message,state:MESSAGE_STATE.QUEUED};}
export function reconcileCommunicationEvents(events=[]) {
  const seen=new Set(), accepted=[],conflicts=[];
  for(const e of events){const k=e.idempotencyKey||e.id;if(!k||seen.has(k))continue;seen.add(k);if(e.baseVersion!=null&&e.currentVersion!=null&&e.baseVersion!==e.currentVersion){conflicts.push({entityId:e.entityId,event:e,reason:"base-version-conflict"});continue}accepted.push(e);}
  return {accepted,conflicts,duplicates:events.length-seen.size};
}
export function notificationPlan({message,preferences={}}={}) {
  if(!message)return {channels:[]};
  if(preferences.muted)return {channels:[],reason:"muted"};
  const channels=message.security===SECURITY.RESTRICTED?["in-app"]:preferences.channels||["in-app"];
  return {channels,priority:message.security===SECURITY.SENSITIVE?"high":"normal",collapseKey:message.conversationId};
}
export function createCalendarEvent({id:eventId,title,start,end,attendeeIds=[],meetingId=null,recurrence=null,timezone="UTC"}={}) {
  return {schema:"evaarta.calendar-event.v1",id:id("event",eventId),title,start,end,attendeeIds:uniq(attendeeIds),meetingId,recurrence,timezone};
}
export function eventToICS(event){
  const esc=v=>String(v??"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n");
  const fmt=d=>new Date(d).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
  return ["BEGIN:VEVENT",`UID:${esc(event.id)}`,`DTSTART:${fmt(event.start)}`,`DTEND:${fmt(event.end||event.start)}`,`SUMMARY:${esc(event.title)}`,event.meetingId?`X-EVAARTA-MEETING:${esc(event.meetingId)}`:null,"END:VEVENT"].filter(Boolean).join("\r\n");
}
export function availability(events=[],personId,{from,to}={}) {
  return events.filter(e=>e.attendeeIds?.includes(personId)&&new Date(e.end)>new Date(from)&&new Date(e.start)<new Date(to))
    .sort((a,b)=>new Date(a.start)-new Date(b.start));
}
export function createMeeting({id:meetingId,title="",conversationId=null,calendarEventId=null,participantIds=[],transcript="",recordingDocumentId=null}={}) {
  return {schema:"evaarta.meeting.v1",id:id("meeting",meetingId),title,conversationId,calendarEventId,participantIds:uniq(participantIds),transcript,recordingDocumentId,decisions:[],actions:[],summary:""};
}
export function analyzeMeeting({transcript="",decisions=[],actions=[]}={}) {
  const lines=String(transcript).split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const detected=lines.filter(x=>/\b(action|todo|to-do|will|need to|deadline|by|owner|decided|decision)\b/i.test(x));
  const detectedDecisions=lines.filter(x=>/\b(decided|decision|agreed|approve|approved)\b/i.test(x));
  return {summary:lines.join(" ").split(/\s+/).slice(0,120).join(" "),decisions:[...decisions,...detectedDecisions.map((text,i)=>({id:"decision-"+(i+1),text,source:"transcript"}))],actions:[...actions,...detected.map((text,i)=>({id:"action-"+(i+1),text,source:"transcript"}))]};
}
export function communicationToTask(message,{projectId=null,title=null}={}) {
  const text=String(message?.body||""); if(!/\b(todo|action|please|need to|deadline|by)\b/i.test(text)) return null;
  return {schema:"evaarta.task.v1",id:"task-"+message.id,title:title||text.split(/\s+/).slice(0,12).join(" "),projectId,sourceMessageId:message.id,sourceIds:[message.id],status:"inbox"};
}
export function communicationToDecision(message) {
  if(!/\b(decided|decision|approved|approve|agreed)\b/i.test(String(message?.body||"")))return null;
  return {schema:"evaarta.decision.v1",id:"decision-"+message.id,text:message.body,sourceIds:[message.id]};
}
export function groundedCommunicationAnswer({answer,sourceIds=[],claims=[],actions=[],allowedCapabilities=[]}={}) {
  return {schema:"evaarta.grounded-communication.v1",answer,sourceIds:[...new Set(sourceIds)],claims,actions,permissions:[...allowedCapabilities]};
}
export function buildCommunicationWorkflow({trigger,conditions=[],actions=[],authorization="required"}={}) {
  return {schema:"evaarta.communication-workflow.v1",trigger,conditions,actions,authorization,audit:true};
}
export function evaluateCommunicationWorkflow(workflow,event) {
  const matched=workflow?.trigger===event?.type&&workflow.conditions.every(c=>event?.[c.field]===c.equals);
  return {matched,actions:matched?workflow.actions:[],authorization:workflow?.authorization||"required"};
}
export function createCommunicationPolicy({retentionDays=null,legalHold=false,dlpRules=[],externalLinkPolicy="warn",encryptionRequired=false}={}) {
  return {schema:"evaarta.communication-policy.v1",retentionDays,legalHold,dlpRules,externalLinkPolicy,encryptionRequired};
}
export function evaluateMessagePolicy(message,policy={}) {
  const findings=[];
  if(policy.encryptionRequired&&!message.encrypted)findings.push({rule:"encryption-required"});
  if(policy.dlpRules?.some(r=>new RegExp(r,"i").test(message.body)))findings.push({rule:"dlp-match"});
  if(policy.externalLinkPolicy==="block"&&/https?:\/\//i.test(message.body))findings.push({rule:"external-link"});
  return {allowed:findings.length===0,findings};
}
export function standardProviderCatalog(){return [
  {provider:"thunderbird-email",channels:["email"],capabilities:["receive","send","attachments","search","offline-queue"]},
  {provider:"sms",channels:["sms"],capabilities:["receive","send"]},
  {provider:"rcs",channels:["rcs"],capabilities:["receive","send","attachments","reactions"]},
  {provider:"matrix",channels:["matrix"],capabilities:["receive","send","rooms","reactions","offline"]},
  {provider:"telegram",channels:["telegram"],capabilities:["receive","send","attachments"]},
  {provider:"whatsapp",channels:["whatsapp"],capabilities:["receive","send","attachments"]},
  {provider:"slack",channels:["slack"],capabilities:["receive","send","channels","threads","reactions"]},
  {provider:"teams",channels:["teams"],capabilities:["receive","send","channels","threads","meetings"]}
];}
export function messageToEML(message,{from="",to=[],subject=""}={}) {
  const esc=v=>String(v??"").replace(/\r?\n/g," ");
  return ["MIME-Version: 1.0","Content-Type: text/plain; charset=UTF-8",`From: ${esc(from)}`,`To: ${to.map(esc).join(", ")}`,`Subject: ${esc(subject)}`,"",String(message?.body??"")].join("\r\n");
}
export function vCardForPerson(person){
  const esc=v=>String(v??"").replace(/[\\;\n,]/g,m=>"\\"+m);
  return ["BEGIN:VCARD","VERSION:4.0",`UID:${esc(person.id)}`,`FN:${esc(person.name)}`,...(person.addresses||[]).map(v=>`EMAIL:${esc(v)}`),...(person.phones||[]).map(v=>`TEL:${esc(v)}`),"END:VCARD"].join("\r\n");
}
export function createAuditEvent({actorId,action,targetId,sourceIds=[],result="allowed",timestamp=new Date().toISOString()}={}) {
  return Object.freeze({schema:"evaarta.communication-audit.v1",actorId,action,targetId,sourceIds:[...new Set(sourceIds)],result,timestamp});
}
export function communicationInteroperability(kind,payload) {
  return {schema:"evaarta.communication-interoperability.v1",kind,sourceFormat:kind,payload,preserved:true,warnings:[]};
}
export function communicationSecurityEnvelope({message,deviceId,signature=null,encrypted=false}={}) {
  return {schema:"evaarta.communication-envelope.v1",messageId:message?.id,deviceId,signature,encrypted,algorithm:encrypted?"provider-or-platform-key":null};
}
export function buildCommunicationGraph(store) {
  const nodes=[],edges=[]; const add=(type,id,source)=>nodes.push({type,id,source});
  store.people.forEach(x=>add("person",x.id,x)); store.conversations.forEach(x=>add("conversation",x.id,x));
  store.messages.forEach(x=>{add("message",x.id,x);edges.push({from:x.id,to:x.conversationId,type:"in-conversation"});edges.push({from:x.id,to:x.senderId,type:"sent-by"});x.recipientIds.forEach(r=>edges.push({from:x.id,to:r,type:"sent-to"}));x.evidenceIds.forEach(e=>edges.push({from:x.id,to:e,type:"supports"}));});
  return {schema:"evaarta.communication-graph.v1",nodes,edges};
}
export function communicationSuiteContract() {
  return Object.freeze({phases:[1,2,3,4,5,6,7],capabilities:[
    "universal-message-model","conversation-store","people-identity-resolution","provider-adapters","unified-inbox","conversation-workspace",
    "notification-center","team-chat","offline-send-queue","calendar-engine","meeting-workspace","meeting-intelligence","external-channel-adapters",
    "communication-ai","reply-intelligence","communication-to-task","communication-to-decision","grounded-search","workflow-automation",
    "encryption-boundary","policy-dlp","retention","legal-hold","audit","interoperability"
  ],semanticChain:["person","conversation","message","channel","evidence","decision","task","project","report","citation","communication-output"]});
}
