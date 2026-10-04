export const EVAARTA_JOURNAL_VERSION = 1;

export function createMutation({ id, operation, targetId, before = null, after = null, createdAt = new Date().toISOString() }) {
  if (!operation || !targetId) throw new TypeError("operation and targetId are required.");
  return { id, journalVersion: EVAARTA_JOURNAL_VERSION, operation, targetId, before, after, createdAt };
}
export function appendMutation(journal, mutation) { return [...(journal || []), mutation]; }
export function inverseMutation(mutation) {
  return { ...mutation, id: mutation.id + ":inverse", before: mutation.after, after: mutation.before };
}
