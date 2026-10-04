import { deserializeWorkspace } from "./EvaartaDocumentWorkspace.sys.mjs";
import { deserializeWorkspaceRecord, serializeWorkspaceRecord } from "./EvaartaWorkspacePersistence.sys.mjs";

export function exportWorkspaceRecord(record) { return serializeWorkspaceRecord(record); }
export function importWorkspaceRecord(serialized) {
  const record = deserializeWorkspaceRecord(serialized);
  record.workspace = deserializeWorkspace(record.workspace);
  return record;
}
