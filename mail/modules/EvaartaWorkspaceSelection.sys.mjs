/* MPL-2.0 */
export function normalizeSelection(ids=[],knownIds=[]) {
  const known=new Set(knownIds);
  return [...new Set(ids)].filter(id=>known.has(id));
}
export function toggleSelection(ids=[],id,knownIds=[]) {
  const current=new Set(normalizeSelection(ids,knownIds));
  current.has(id)?current.delete(id):current.add(id);
  return [...current];
}