import { deserializeWorkspaceRecord } from "./EvaartaWorkspacePersistence.sys.mjs";

export class EvaartaWorkspaceCatalog {
  constructor(store) { this.store = store; }
  async describe(workspaceId) {
    const loaded = await this.store.load(workspaceId);
    if (!loaded) return null;
    const workspace = loaded.record.workspace;
    return {
      id: workspace.id, name: workspace.name, description: workspace.description,
      revision: loaded.record.revision, updatedAt: workspace.updatedAt,
      documentCount: workspace.documents?.length || 0,
      itemCount: workspace.items?.length || 0,
      evidenceGroupCount: workspace.evidenceGroups?.length || 0,
      recovered: loaded.recovered,
    };
  }
  async validate(serialized) {
    const record = deserializeWorkspaceRecord(serialized);
    return { workspaceId: record.workspaceId, revision: record.revision, valid: true };
  }
}
