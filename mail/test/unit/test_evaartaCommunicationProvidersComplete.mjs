import { providerCapabilities, createTransportRequest } from "../../modules/EvaartaCommunicationProvidersComplete.sys.mjs";
import { createNotificationRule, evaluateNotification } from "../../modules/EvaartaNotificationPolicy.sys.mjs";
import { createMeetingWorkspace, addMeetingDecision } from "../../modules/EvaartaMeetingWorkspace.sys.mjs";
import { createDeviceKeyRef, createAccountKeySet, rotateKeySet } from "../../modules/EvaartaSecurityCryptoBoundary.sys.mjs";
add_task(function test_providers(){Assert.ok(providerCapabilities("matrix"));Assert.equal(createTransportRequest({provider:"smtp",operation:"send",accountId:"a"}).provider,"smtp");});
add_task(function test_notifications(){const r=createNotificationRule({id:"r",match:{kind:"mention"},channel:"push"});Assert.ok(evaluateNotification(r,{kind:"mention"}).deliver);});
add_task(function test_meeting(){let w=createMeetingWorkspace({meetingId:"m",title:"T"});w=addMeetingDecision(w,{id:"d",text:"Decision"});Assert.equal(w.decisions.length,1);});
add_task(function test_crypto(){const a=createDeviceKeyRef({deviceId:"d",keyId:"k",state:"active"});const ks=createAccountKeySet({accountId:"a",deviceKeys:[a]});Assert.equal(rotateKeySet(ks,{deviceId:"d2",keyId:"k2"}).deviceKeys.length,2);});
