/* MPL-2.0 */
export function createSyncSurface(session){ return {session,transport:"deferred",networkEnabled:false,status:"local-only"}; }
export function describeSyncBoundary(){ return {networkEnabled:false,authentication:"deferred",encryption:"deferred",conflictResolution:"local-contract"}; }