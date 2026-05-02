// Returns true if bird matches the given filter key
export function matchesFilter(bird, filter) {
  if (filter === 'all') return true;
  if (filter === 'frequent-fliers') return !!bird.frequentFlier;
  if (filter === 'songbirds') return bird.type === 'Songbirds';
  if (filter === 'birds-of-prey') return bird.type === 'Birds of Prey';
  if (filter === 'waterbird') return bird.type === 'Waterbird';
  if (filter === 'shorebird') return bird.type === 'Shorebird';
  if (filter === 'duck') return bird.type === 'Duck';
  if (filter === 'goose') return bird.type === 'Goose';
  if (filter === 'gull') return bird.type === 'Gull';
  if (filter === 'other') return bird.type === 'Other';
  return true;
}
