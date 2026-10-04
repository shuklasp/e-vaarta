export const COMMUNICATION_BENCHMARKS = Object.freeze([
 "universal-message-model","identity-resolution","conversation-threading","unified-inbox","cross-channel-search",
 "offline-send-queue","team-chat","calendar","availability","meeting-workspace","meeting-intelligence",
 "external-adapter-normalization","communication-ai","reply-grounding","message-to-task","message-to-decision",
 "workflow-automation","notification-policy","encryption-boundary","dlp","retention","legal-hold","audit",
 "eml-mbox-maildir","ics-vcard","semantic-traceability"
]);
export function communicationBenchmarkPassed(results=[]){return COMMUNICATION_BENCHMARKS.every(id=>results.find(r=>r.id===id)?.passed===true);}
