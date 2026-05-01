import { describe, it, expect } from 'vitest';
import { matchesFilter } from '../filter.js';

// Minimal bird stubs — only fields matchesFilter reads
const bird = (overrides) => ({
  type: 'Songbird',
  season: 'Year-Round',
  frequentFlier: false,
  ...overrides,
});

describe('matchesFilter', () => {
  it('all — always true', () => {
    expect(matchesFilter(bird({ type: 'Gull' }), 'all')).toBe(true);
  });

  it('frequent-fliers — requires frequentFlier flag', () => {
    expect(matchesFilter(bird({ frequentFlier: true }), 'frequent-fliers')).toBe(true);
    expect(matchesFilter(bird(), 'frequent-fliers')).toBe(false);
  });

  it('songbird', () => {
    expect(matchesFilter(bird({ type: 'Songbird' }), 'songbird')).toBe(true);
    expect(matchesFilter(bird({ type: 'Raptor' }), 'songbird')).toBe(false);
  });

  it('raptor — includes Raptor and Owl', () => {
    expect(matchesFilter(bird({ type: 'Raptor' }), 'raptor')).toBe(true);
    expect(matchesFilter(bird({ type: 'Owl' }), 'raptor')).toBe(true);
    expect(matchesFilter(bird({ type: 'Songbird' }), 'raptor')).toBe(false);
  });

  it('waterbird', () => {
    expect(matchesFilter(bird({ type: 'Waterbird' }), 'waterbird')).toBe(true);
    expect(matchesFilter(bird({ type: 'Duck' }), 'waterbird')).toBe(false);
  });

  it('shorebird', () => {
    expect(matchesFilter(bird({ type: 'Shorebird' }), 'shorebird')).toBe(true);
  });

  it('woodpecker', () => {
    expect(matchesFilter(bird({ type: 'Woodpecker' }), 'woodpecker')).toBe(true);
  });

  it('waterfowl — includes Duck and Goose', () => {
    expect(matchesFilter(bird({ type: 'Duck' }), 'waterfowl')).toBe(true);
    expect(matchesFilter(bird({ type: 'Goose' }), 'waterfowl')).toBe(true);
    expect(matchesFilter(bird({ type: 'Waterbird' }), 'waterfowl')).toBe(false);
  });

  it('gulls', () => {
    expect(matchesFilter(bird({ type: 'Gull' }), 'gulls')).toBe(true);
    expect(matchesFilter(bird({ type: 'Shorebird' }), 'gulls')).toBe(false);
  });

  it('year-round', () => {
    expect(matchesFilter(bird({ season: 'Year-Round' }), 'year-round')).toBe(true);
    expect(matchesFilter(bird({ season: 'Winter (Nov–Mar)' }), 'year-round')).toBe(false);
  });

  it('summer — matches summer months, excludes year-round and winter', () => {
    // Note: 'Sept' is an exclusion term, so seasons running into September are excluded
    expect(matchesFilter(bird({ season: 'April–August' }), 'summer')).toBe(true);
    expect(matchesFilter(bird({ season: 'May–August' }), 'summer')).toBe(true);
    expect(matchesFilter(bird({ season: 'Year-Round' }), 'summer')).toBe(false);
    expect(matchesFilter(bird({ season: 'Nov–Mar' }), 'summer')).toBe(false);
  });

  it('winter — includes Oct/Nov/Sept arrivals and Year-Round birds', () => {
    expect(matchesFilter(bird({ season: 'Nov–Mar' }), 'winter')).toBe(true);
    expect(matchesFilter(bird({ season: 'Oct–Apr' }), 'winter')).toBe(true);
    expect(matchesFilter(bird({ season: 'Year-Round' }), 'winter')).toBe(true);
    expect(matchesFilter(bird({ season: 'Aug–May' }), 'winter')).toBe(true);
    expect(matchesFilter(bird({ season: 'April–August' }), 'winter')).toBe(false);
  });

  it('unknown filter — falls through to true', () => {
    expect(matchesFilter(bird(), 'bogus-filter')).toBe(true);
  });
});
