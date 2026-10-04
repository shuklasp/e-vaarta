/* MPL-2.0 */
import { createValidationCase } from "./EvaartaProductionIntegration.sys.mjs";
export const E2E_CASES=Object.freeze([
createValidationCase({id:"mail-offline-send-reconnect",domain:"communication",environment:"desktop-real-mailbox",steps:["disconnect","compose","queue","restart","reconnect","sync"],expected:["single-send","preserved-thread","no-duplicate"]}),
createValidationCase({id:"provider-normalization-roundtrip",domain:"interoperability",environment:"provider-sandbox",steps:["receive","normalize","store","export"],expected:["provenance-preserved","loss-reported"]}),
createValidationCase({id:"calendar-rsvp-roundtrip",domain:"calendar",environment:"caldav-or-exchange-sandbox",steps:["create","invite","accept","update","sync"],expected:["stable-uid","timezone-safe","no-duplicate"]}),
createValidationCase({id:"credential-isolation",domain:"security",environment:"desktop",steps:["connect","inspect-semantic-objects","disconnect"],expected:["no-secret-material-in-semantic-store"]}),
createValidationCase({id:"power-loss-during-send",domain:"recovery",environment:"desktop",steps:["queue","interrupt","restart","reconcile"],expected:["idempotent","no-message-loss","no-duplicate"]}),
createValidationCase({id:"accessibility-conversation-flow",domain:"accessibility",environment:"desktop-and-device",steps:["keyboard-open","screen-reader-navigate","open-thread","reply","send"],expected:["focus-order","announcements","keyboard-complete"]}),
createValidationCase({id:"large-mailbox-search",domain:"performance",environment:"realistic-fixture",steps:["index","search","open-thread"],expected:["bounded-memory","measured-p95","no-ui-blocking"]})
]);
export function validationPlan(){return {schema:"evaarta.e2e-validation-plan.v1",cases:E2E_CASES,releaseRule:"do-not-label-validated-until-environment-specific-evidence-exists"};}
