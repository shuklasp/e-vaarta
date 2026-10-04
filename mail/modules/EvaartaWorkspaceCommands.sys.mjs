/* MPL-2.0 */
export const WorkspaceCommand = Object.freeze({
  OPEN: "open",
  NEW_NOTE: "new-note",
  CAPTURE: "capture",
  ANNOTATE: "annotate",
  SEARCH: "search",
  EXPORT: "export",
  IMPORT: "import",
});

export function createWorkspaceCommand(type, payload = {}) {
  if (!Object.values(WorkspaceCommand).includes(type)) {
    throw new TypeError(`Unknown e-Vaarta workspace command: ${type}`);
  }
  return {
    version: 1,
    id: crypto.randomUUID(),
    type,
    payload: structuredClone(payload),
    createdAt: new Date().toISOString(),
  };
}

export function isWorkspaceCommand(value) {
  return Boolean(
    value &&
    value.version === 1 &&
    typeof value.id === "string" &&
    Object.values(WorkspaceCommand).includes(value.type) &&
    value.payload &&
    typeof value.payload === "object"
  );
}
