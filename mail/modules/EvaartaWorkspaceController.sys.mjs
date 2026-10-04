/* MPL-2.0 */
import { createWorkspaceCommand } from "./EvaartaWorkspaceCommands.sys.mjs";
import { normalizeSearchState } from "./EvaartaSearchState.sys.mjs";
import { diagnoseWorkspace } from "./EvaartaWorkspaceDiagnostics.sys.mjs";

export class EvaartaWorkspaceController {
  constructor({ repository, onStateChange = null } = {}) {
    if (!repository) throw new TypeError("repository is required.");
    this.repository = repository;
    this.onStateChange = onStateChange;
    this.workspace = null;
    this.state = { selectedDocumentId: null, selectedItemId: null, search: normalizeSearchState(), offlineReady: false, diagnostics: null };
  }

  async open(workspaceId) {
    const record = await this.repository.getWithPersistence(workspaceId);
    if (!record) return null;
    this.workspace = record.workspace;
    this.state.offlineReady = true;
    this.state.diagnostics = diagnoseWorkspace(this.workspace);
    this.#emit();
    return this.workspace;
  }

  selectDocument(documentId) { this.state.selectedDocumentId = documentId || null; this.#emit(); }
  selectItem(itemId) { this.state.selectedItemId = itemId || null; this.#emit(); }
  setSearch(input) { this.state.search = normalizeSearchState(input); this.#emit(); }
  command(type, payload = {}) { return createWorkspaceCommand(type, payload); }

  #emit() { this.onStateChange?.(structuredClone(this.state)); }
}