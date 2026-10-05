/* MPL-2.0 */
const uniq = xs => [...new Set((xs || []).filter(Boolean))];
const now = () => new Date().toISOString();

export const ARTIFACT_TYPE = Object.freeze({
  EMAIL:"email", DOCUMENT:"document", PHOTO:"photo", VIDEO:"video", AUDIO:"audio",
  FILE:"file", MESSAGE:"message", NOTE:"note", WEB:"web", EVIDENCE:"evidence"
});
export const ARTIFACT_STATE = Object.freeze({
  ACTIVE:"active", ARCHIVED:"archived", QUARANTINED:"quarantined", BLOCKED:"blocked"
});
export const LINK_TYPE = Object.freeze({
  ATTACHED:"attached", REFERENCES:"references", EVIDENCE:"evidence",
  DERIVED_FROM:"derived-from", GENERATED_FROM:"generated-from"
});
export const SHARE_DECISION = Object.freeze({
  ALLOW:"allow", WARN:"warn", BLOCK:"block", APPROVAL_REQUIRED:"approval-required"
});

export function createArtifact(input={}) {
  if (!input.id || !input.type) throw new TypeError("artifact id/type required");
  if (!Object.values(ARTIFACT_TYPE).includes(input.type)) throw new RangeError("unsupported artifact type");
  return Object.freeze({
    schema:"evaarta.artifact.v1", id:input.id, type:input.type, name:input.name ?? "",
    mime:input.mime ?? "application/octet-stream", size:Number(input.size)||0,
    contentHash:input.contentHash ?? null, sourceId:input.sourceId ?? null,
    sourceType:input.sourceType ?? null, sourceRevisionId:input.sourceRevisionId ?? null,
    state:input.state ?? ARTIFACT_STATE.ACTIVE, security:input.security ?? "normal",
    creatorId:input.creatorId ?? null, createdAt:input.createdAt ?? now(),
    updatedAt:input.updatedAt ?? now(), metadata:{...(input.metadata||{})}
  });
}

export function createArtifactRevision({id,artifactId,contentHash,sourceId=null,createdBy=null,createdAt=now(),label=null}={}) {
  if(!id||!artifactId||!contentHash) throw new TypeError("revision id/artifact id/content hash required");
  return Object.freeze({schema:"evaarta.artifact-revision.v1",id,artifactId,contentHash,sourceId,createdBy,createdAt,label});
}

export function createArtifactLink({id,artifactId,targetType,targetId,type=LINK_TYPE.ATTACHED,sourceId=null,revisionId=null,createdBy=null,createdAt=now(),context=null}={}) {
  if(!id||!artifactId||!targetType||!targetId) throw new TypeError("link identity required");
  return Object.freeze({schema:"evaarta.artifact-link.v1",id,artifactId,targetType,targetId,type,sourceId,revisionId,createdBy,createdAt,context});
}

export function createArtifactStore({artifacts=[],revisions=[],links=[],events=[]}={}) {
  return {schema:"evaarta.artifact-store.v1",version:1,artifacts:[...artifacts],revisions:[...revisions],links:[...links],events:[...events]};
}

export function artifactLinks(store,artifactId,{targetType=null,type=null}={}) {
  return store.links.filter(x=>x.artifactId===artifactId && (!targetType||x.targetType===targetType) && (!type||x.type===type));
}

export function artifactsForTarget(store,targetType,targetId) {
  const ids=new Set(store.links.filter(x=>x.targetType===targetType&&x.targetId===targetId).map(x=>x.artifactId));
  return store.artifacts.filter(x=>ids.has(x.id));
}

export function linkArtifact(store,artifact, target, options={}) {
  const targetType=typeof target==="string"?options.targetType:target?.type;
  const targetId=typeof target==="string"?target:target?.id;
  if(!targetType||!targetId) throw new TypeError("target type/id required");
  const link=createArtifactLink({
    id:options.id || `link-${artifact.id}-${targetType}-${targetId}-${Date.now()}`,
    artifactId:artifact.id,targetType,targetId,type:options.type||LINK_TYPE.ATTACHED,
    sourceId:options.sourceId??artifact.sourceId,revisionId:options.revisionId??artifact.sourceRevisionId,
    createdBy:options.createdBy??null,context:options.context??null
  });
  return {...store,links:[...store.links,link],events:[...store.events,createArtifactEvent({type:"linked",artifactId:artifact.id,targetType,targetId,actorId:options.createdBy})]};
}

export function unlinkArtifact(store,linkId,actorId=null) {
  const link=store.links.find(x=>x.id===linkId); if(!link) return store;
  return {...store,links:store.links.filter(x=>x.id!==linkId),events:[...store.events,createArtifactEvent({type:"unlinked",artifactId:link.artifactId,targetType:link.targetType,targetId:link.targetId,actorId})]};
}

export function propagateArtifacts(store,{fromType,fromId,toType,toId,artifactIds=null,createdBy=null,context=null}={}) {
  const sourceLinks=store.links.filter(x=>x.targetType===fromType&&x.targetId===fromId);
  const allowed=artifactIds?new Set(artifactIds):null;
  let next=store;
  for(const link of sourceLinks) {
    if(allowed&&!allowed.has(link.artifactId)) continue;
    if(next.links.some(x=>x.targetType===toType&&x.targetId===toId&&x.artifactId===link.artifactId)) continue;
    const artifact=next.artifacts.find(x=>x.id===link.artifactId);
    if(!artifact) continue;
    next=linkArtifact(next,artifact,{targetType:toType,id:`link-${artifact.id}-${toType}-${toId}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,createdBy,context,revisionId:link.revisionId,type:LINK_TYPE.ATTACHED});
  }
  return next;
}

export function createArtifactEvent({type,artifactId,targetType=null,targetId=null,actorId=null,details=null,at=now()}={}) {
  return Object.freeze({schema:"evaarta.artifact-event.v1",id:`artifact-event-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,type,artifactId,targetType,targetId,actorId,details,at});
}

export function buildArtifactProvenance(store,artifactId) {
  const artifact=store.artifacts.find(x=>x.id===artifactId);
  if(!artifact) return null;
  const revisions=store.revisions.filter(x=>x.artifactId===artifactId);
  const links=artifactLinks(store,artifactId);
  return Object.freeze({artifact:{...artifact},revisions:[...revisions],links:[...links],events:store.events.filter(x=>x.artifactId===artifactId)});
}

export function evaluateArtifactShare({artifact,recipientType="internal",recipientIds=[],policy={}}={}) {
  if(!artifact) return {decision:SHARE_DECISION.BLOCK,reason:"artifact-missing"};
  if(artifact.state===ARTIFACT_STATE.BLOCKED||artifact.state===ARTIFACT_STATE.QUARANTINED) return {decision:SHARE_DECISION.BLOCK,reason:"artifact-not-shareable"};
  if(artifact.security==="restricted" && recipientType==="external") {
    return {decision:policy.allowRestrictedExternal?SHARE_DECISION.APPROVAL_REQUIRED:SHARE_DECISION.BLOCK,reason:"restricted-external"};
  }
  if(artifact.security==="confidential" && recipientType==="external") return {decision:SHARE_DECISION.WARN,reason:"confidential-external"};
  if(policy.blockRecipients?.some(id=>recipientIds.includes(id))) return {decision:SHARE_DECISION.BLOCK,reason:"recipient-policy"};
  return {decision:SHARE_DECISION.ALLOW,reason:"policy-passed"};
}

export function selectArtifactsForShare(store,artifactIds,shareContext={}) {
  return artifactIds.map(id=>store.artifacts.find(x=>x.id===id)).filter(Boolean).map(artifact=>({
    artifact,...evaluateArtifactShare({artifact,...shareContext})
  }));
}

export function createTaskArtifactLinks(store,{taskId,artifactIds=[],createdBy=null}={}) {
  let next=store;
  for(const artifactId of uniq(artifactIds)) {
    const artifact=next.artifacts.find(x=>x.id===artifactId); if(!artifact) continue;
    if(next.links.some(x=>x.targetType==="task"&&x.targetId===taskId&&x.artifactId===artifactId)) continue;
    next=linkArtifact(next,artifact,{targetType:"task",id:`task-link-${taskId}-${artifactId}-${Date.now()}`,createdBy});
  }
  return next;
}

export function forwardTaskArtifacts(store,{fromTaskId,toTaskId,artifactIds=null,createdBy=null,context=null}={}) {
  return propagateArtifacts(store,{fromType:"task",fromId:fromTaskId,toType:"task",toId:toTaskId,artifactIds,createdBy,context});
}

export function createCommunicationShare(store,{targetType,targetId,artifactIds=[],createdBy=null,recipientType="internal",recipientIds=[],policy={}}={}) {
  const selected=selectArtifactsForShare(store,artifactIds,{recipientType,recipientIds,policy});
  const blocked=selected.filter(x=>x.decision===SHARE_DECISION.BLOCK);
  if(blocked.length) return {store,selected,allowed:false,reason:"one-or-more-artifacts-blocked"};
  let next=store;
  for(const item of selected) {
    if(next.links.some(x=>x.targetType===targetType&&x.targetId===targetId&&x.artifactId===item.artifact.id)) continue;
    next=linkArtifact(next,item.artifact,{targetType,targetId,createdBy,context:{recipientType,recipientIds},type:LINK_TYPE.REFERENCES});
  }
  return {store:next,selected,allowed:true};
}

export function createEvidenceReference(store,{artifactId,evidenceId,createdBy=null,revisionId=null}={}) {
  const artifact=store.artifacts.find(x=>x.id===artifactId); if(!artifact) throw new RangeError("artifact not found");
  return linkArtifact(store,artifact,{targetType:"evidence",targetId:evidenceId,type:LINK_TYPE.EVIDENCE,createdBy,revisionId});
}

export function artifactUsageSummary(store,artifactId) {
  const links=artifactLinks(store,artifactId);
  return Object.freeze({artifactId,usageCount:links.length,targets:links.map(x=>({type:x.targetType,id:x.targetId,typeOfLink:x.type})),targetTypes:[...new Set(links.map(x=>x.targetType))]});
}

export function universalAttachmentContract() {
  return Object.freeze({
    schema:"evaarta.universal-attachment.v1",stableIdentity:true,contentAddressed:true,
    reusableReferences:true,taskPropagation:true,communicationSharing:true,evidenceLinking:true,
    revisionAware:true,provenance:true,securityPolicy:true,offlineFirst:true,noImplicitDuplication:true
  });
}
