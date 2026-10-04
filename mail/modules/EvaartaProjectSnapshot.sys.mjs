/* MPL-2.0 */
export function createProjectSnapshot({projectId,journal,capabilities=[],identities=[]}){return {protocol:"e-vaarta",version:1,projectId,events:journal.manifest(),capabilities,identities,createdAt:new Date().toISOString()};}
