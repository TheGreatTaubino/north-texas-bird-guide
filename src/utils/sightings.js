// Merges incoming sighting data into existing, rejecting unknown/invalid bird IDs
export function mergeSightings(existing, incoming, validBirdIds) {
  const merged = { ...existing };
  for (const [dateKey, ids] of Object.entries(incoming)) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey) && Array.isArray(ids)) {
      const current = new Set(merged[dateKey] || []);
      ids.filter(id => typeof id === 'string' && validBirdIds.has(id))
         .forEach(id => current.add(id));
      merged[dateKey] = [...current];
    }
  }
  return merged;
}
