export const RAPTOR_TYPES = new Set(['Raptor', 'Owl']);

// Returns true if bird matches the given filter key
export function matchesFilter(bird, filter) {
  if (filter === 'all') return true;
  if (filter === 'frequent-fliers') return !!bird.frequentFlier;
  if (filter === 'songbird') return bird.type === 'Songbird';
  if (filter === 'raptor') return RAPTOR_TYPES.has(bird.type);
  if (filter === 'waterbird') return bird.type === 'Waterbird';
  if (filter === 'shorebird') return bird.type === 'Shorebird';
  if (filter === 'woodpecker') return bird.type === 'Woodpecker';
  if (filter === 'waterfowl') return bird.type === 'Duck' || bird.type === 'Goose';
  if (filter === 'gulls') return bird.type === 'Gull';
  if (filter === 'year-round') return bird.season.toLowerCase().includes('year-round');
  if (filter === 'summer') {
    const s = bird.season;
    return (
      s.includes('April') || s.includes('March') || s.includes('May') || s.includes('Aug')
    ) && !s.includes('Year-Round') && !s.includes('Nov') && !s.includes('Oct') && !s.includes('Sept');
  }
  if (filter === 'winter') {
    const s = bird.season;
    return s.includes('Nov') || s.includes('Oct') || s.includes('Sept') || s.includes('Aug–May') || s.includes('Year-Round');
  }
  return true;
}
