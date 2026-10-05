/* MPL-2.0 */
import {createArtifact,createArtifactStore,linkArtifact,artifactsForTarget,forwardTaskArtifacts,createCommunicationShare,evaluateArtifactShare,createArtifactRevision,buildArtifactProvenance,universalAttachmentContract} from "../EvaartaArtifactLifecycle.sys.mjs";

const assert=(x,m)=>{if(!x)throw new Error(m||"assertion failed")};

const photo=createArtifact({id:"photo-1",type:"photo",name:"damage.jpg",mime:"image/jpeg",contentHash:"sha256:abc",security:"confidential",sourceId:"camera-1"});
let store=createArtifactStore({artifacts:[photo]});
store=linkArtifact(store,photo,{targetType:"task",targetId:"task-a",createdBy:"user-1"});
assert(artifactsForTarget(store,"task","task-a").length===1);
store=forwardTaskArtifacts(store,{fromTaskId:"task-a",toTaskId:"task-b",createdBy:"user-1"});
assert(artifactsForTarget(store,"task","task-b")[0].id==="photo-1");
const shared=createCommunicationShare(store,{targetType:"message",targetId:"message-1",artifactIds:["photo-1"],recipientType:"external",recipientIds:["supplier"],policy:{}});
assert(shared.allowed);
assert(evaluateArtifactShare({artifact:photo,recipientType:"external",policy:{allowRestrictedExternal:false}}).decision==="warn");
const restricted=createArtifact({id:"secret-1",type:"document",contentHash:"sha256:secret",security:"restricted"});
assert(evaluateArtifactShare({artifact:restricted,recipientType:"external",policy:{}}).decision==="block");
const revision=createArtifactRevision({id:"rev-1",artifactId:"photo-1",contentHash:"sha256:def"});
store={...store,revisions:[revision]};
assert(buildArtifactProvenance(store,"photo-1").revisions.length===1);
assert(universalAttachmentContract().taskPropagation===true);
