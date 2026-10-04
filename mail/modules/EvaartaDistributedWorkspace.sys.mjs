/* MPL-2.0 */
import { EvaartaEventJournal } from "./EvaartaEventJournal.sys.mjs";
import { EvaartaStoreForwardQueue } from "./EvaartaStoreForwardQueue.sys.mjs";
export function createDistributedWorkspace({workspaceId,events=[]}={}){return {workspaceId,journal:new EvaartaEventJournal(events),deliveryQueue:new EvaartaStoreForwardQueue(),sync:{state:"offline-ready",lastSync:null}};}
