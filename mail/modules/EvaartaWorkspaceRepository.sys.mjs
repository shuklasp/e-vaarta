import { createWorkspace } from "./EvaartaDocumentWorkspace.sys.mjs";

export class EvaartaWorkspaceRepository {
  constructor(store) {
    if (!store?.load || !store?.save) throw new TypeError("A workspace store is required.");
    this.store = store;
  }
  async create(name, description = "") {
    const workspace = createWorkspace({ name, description });
    await this.store.save(workspace);
    return workspace;
  }
  async get(workspaceId) {
    const loaded = await this.store.load(workspaceId);
    return loaded?.record.workspace || null;
  }
  async getWithPersistence(workspaceId) { return this.store.load(workspaceId); }
  async save(workspace, options = {}) { return (await this.store.save(workspace, options)).record.workspace; }
  async recover(workspaceId) {
    const loaded = await this.store.recover(workspaceId);
    return loaded?.record.workspace || null;
  }
  async remove(workspaceId) { await this.store.remove(workspaceId); }
}
