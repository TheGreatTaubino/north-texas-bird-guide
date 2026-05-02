import { describe, it, expect } from 'vitest';
import { matchesFilter } from '../filter.js';

// Minimal bird stubs — only fields matchesFilter reads
const bird = (overrides) => ({
  type: 'Songbirds',
  season: 'Year-Round',
  frequentFlier: false,
  ...overrides,
});

describe('matchesFilter', () => {
  it('all — always true', () => {
    expect(matchesFilter(bird({ type: 'Waterfowl' }), 'all')).toBe(true);
  });

  it('frequent-fliers — requires frequentFlier flag', () => {
    expect(matchesFilter(bird({ frequentFlier: true }), 'frequent-fliers')).toBe(true);
    expect(matchesFilter(bird(), 'frequent-fliers')).toBe(false);
  });

  it('songbirds', () => {
    expect(matchesFilter(bird({ type: 'Songbirds' }), 'songbirds')).toBe(true);
    expect(matchesFilter(bird({ type: 'Birds of Prey' }), 'songbirds')).toBe(false);
  });

  it('birds-of-prey — includes Raptors and Owls', () => {
    expect(matchesFilter(bird({ type: 'Birds of Prey' }), 'birds-of-prey')).toBe(true);
    expect(matchesFilter(bird({ type: 'Songbirds' }), 'birds-of-prey')).toBe(false);
  });

  it('waterbird', () => {
    expect(matchesFilter(bird({ type: 'Waterbird' }), 'waterbird')).toBe(true);
    expect(matchesFilter(bird({ type: 'Shorebird' }), 'waterbird')).toBe(false);
  });

  it('shorebird', () => {
    expect(matchesFilter(bird({ type: 'Shorebird' }), 'shorebird')).toBe(true);
    expect(matchesFilter(bird({ type: 'Waterbird' }), 'shorebird')).toBe(false);
  });

  it('duck', () => {
    expect(matchesFilter(bird({ type: 'Duck' }), 'duck')).toBe(true);
    expect(matchesFilter(bird({ type: 'Goose' }), 'duck')).toBe(false);
  });

  it('goose', () => {
    expect(matchesFilter(bird({ type: 'Goose' }), 'goose')).toBe(true);
    expect(matchesFilter(bird({ type: 'Duck' }), 'goose')).toBe(false);
  });

  it('gull', () => {
    expect(matchesFilter(bird({ type: 'Gull' }), 'gull')).toBe(true);
    expect(matchesFilter(bird({ type: 'Shorebird' }), 'gull')).toBe(false);
  });

  it('other — woodpeckers, hummingbirds, doves, etc.', () => {
    expect(matchesFilter(bird({ type: 'Other' }), 'other')).toBe(true);
    expect(matchesFilter(bird({ type: 'Duck' }), 'other')).toBe(false);
  });

  it('unknown filter — falls through to true', () => {
    expect(matchesFilter(bird(), 'bogus-filter')).toBe(true);
  });
});
