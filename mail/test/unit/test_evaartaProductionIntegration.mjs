import test from "node:test";
import assert from "node:assert/strict";
import { createCredentialReference, createCapabilityToken, authorizeAction, createRetentionDecision } from "../../mail/modules/EvaartaProductionIntegration.sys.mjs";
import { createProviderAdapter, canProvider, normalizeProviderEnvelope } from "../../mail/modules/EvaartaProviderAdapters.sys.mjs";
import { createCalendarAdapter, calendarRequest, mergeFreeBusy } from "../../mail/modules/EvaartaCalendarProviders.sys.mjs";
import { classifyCommunication, secureDeletionDecision } from "../../mail/modules/EvaartaSecurityBoundary.sys.mjs";

test("credentials contain references, not secret material",()=>{const r=createCredentialReference({provider:"slack",accountId:"a",secretRef:"os-keychain:a"});assert.equal(r.secretMaterial,null);assert.equal(r.secretRef,"os-keychain:a");});
test("capability authorization fails closed",()=>{const t=createCapabilityToken({subject:"u",capability:"send",resource:"conversation:c",expiresAt:"2099-01-01T00:00:00Z",nonce:"n"});assert.equal(authorizeAction({token:t,requiredCapability:"send",resource:"conversation:c"}).allowed,true);assert.equal(authorizeAction({token:t,requiredCapability:"delete",resource:"conversation:c"}).allowed,false);});
test("provider boundary normalizes provenance",()=>{const a=createProviderAdapter({id:"s",provider:"slack",channel:"slack",capabilities:["send"]});assert.equal(canProvider(a,"send"),true);const e=normalizeProviderEnvelope({provider:"slack",channel:"slack",externalId:"x",conversationId:"c",sender:"u",body:"hi"});assert.equal(e.provenance.externalId,"x");});
test("calendar free-busy merge is deterministic",()=>{const a=createCalendarAdapter({id:"g",provider:"google",capabilities:["free-busy"]});assert.equal(calendarRequest({adapter:a,operation:"free-busy"}).allowed,true);assert.equal(mergeFreeBusy([[{start:"2026-10-01T10:00:00Z",end:"2026-10-01T11:00:00Z"}],[{start:"2026-10-01T10:30:00Z",end:"2026-10-01T12:00:00Z"}]]).length,1);});
test("security fails closed on active attachments",()=>{assert.equal(classifyCommunication({attachments:[{name:"payload.exe"}]}).decision,"require-confirmation");assert.equal(secureDeletionDecision({legalHold:true,retentionExpired:true}).allowed,false);});
