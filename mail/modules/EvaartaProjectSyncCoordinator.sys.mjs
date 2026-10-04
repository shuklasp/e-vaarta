/* MPL-2.0 */
export class EvaartaProjectSyncCoordinator {
 constructor({journal,mergeEngine,receiver,transport}){Object.assign(this,{journal,mergeEngine,receiver,transport});}
 async reconcile(remoteManifest,{peerId,session,projectId}){
  const localManifest=this.journal.manifest(projectId);
  const local=localManifest?.eventIds??[];
  const remote=remoteManifest?.eventIds??[];
  const missing=remote.filter(id=>!local.includes(id));
  return {projectId,missingEventIds:missing,localEventIds:local,remoteEventIds:remote,peerId,authenticated:!!session?.authenticated};
 }
 async applyRemoteEvents(events,context){return this.receiver.receive({protocol:"e-vaarta-runtime",version:1,messageId:crypto.randomUUID(),sessionId:context.sessionId,type:"events",payload:{events}},context);}
}
