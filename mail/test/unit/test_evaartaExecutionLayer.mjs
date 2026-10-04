import { registerProviderHandler, executeProviderRequest } from "../../modules/EvaartaProviderExecutionAdapters.sys.mjs";
import { actionTrace } from "../../modules/EvaartaMessageToActionPipeline.sys.mjs";
import { createExportJob, completeExportJob } from "../../modules/EvaartaExportRuntime.sys.mjs";
add_task(async function test_provider_execution(){registerProviderHandler({provider:"smtp",operation:"send",execute:async req=>({ok:true,idempotencyKey:req.idempotencyKey})});const r=await executeProviderRequest({provider:"smtp",operation:"send",idempotencyKey:"x"});Assert.ok(r.ok);});
add_task(function test_trace(){Assert.equal(actionTrace({messageId:"m",evidenceIds:["e"],decisionId:"d",taskId:"t",projectId:"p"}).projectId,"p");});
add_task(function test_export(){const j=createExportJob({id:"1",operation:"message",format:"eml",entityIds:["m"]});Assert.equal(completeExportJob(j,{artifactId:"a"}).status,"completed");});
