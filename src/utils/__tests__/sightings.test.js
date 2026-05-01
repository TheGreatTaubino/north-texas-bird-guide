import { describe, it, expect } from 'vitest';
import { mergeSightings } from '../sightings.js';

const VALID = new Set(['cardinal', 'bluejay', 'mockingbird']);

describe('mergeSightings', () => {
  it('merges incoming into existing without overwriting', () => {
    const existing = { '2026-05-01': ['cardinal'] };
    const incoming = { '2026-05-01': ['bluejay'] };
    const result = mergeSightings(existing, incoming, VALID);
    expect(result['2026-05-01']).toContain('cardinal');
    expect(result['2026-05-01']).toContain('bluejay');
  });

  it('rejects unknown bird IDs', () => {
    const result = mergeSightings({}, { '2026-05-01': ['cardinal', 'INJECTED_ID', '<script>'] }, VALID);
    expect(result['2026-05-01']).toEqual(['cardinal']);
  });

  it('rejects non-string IDs', () => {
    const result = mergeSightings({}, { '2026-05-01': [123, null, 'cardinal'] }, VALID);
    expect(result['2026-05-01']).toEqual(['cardinal']);
  });

  it('skips keys that do not match YYYY-MM-DD format', () => {
    // Regex validates format only, not calendar validity — '2026-13-99' passes format check
    const result = mergeSightings({}, { 'not-a-date': ['cardinal'], 'bad': ['bluejay'] }, VALID);
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('skips dates where birdIds is not an array', () => {
    const result = mergeSightings({}, { '2026-05-01': 'cardinal' }, VALID);
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('deduplicates IDs within a date', () => {
    const existing = { '2026-05-01': ['cardinal'] };
    const incoming = { '2026-05-01': ['cardinal', 'bluejay'] };
    const result = mergeSightings(existing, incoming, VALID);
    const count = result['2026-05-01'].filter(id => id === 'cardinal').length;
    expect(count).toBe(1);
  });

  it('does not mutate existing object', () => {
    const existing = { '2026-05-01': ['cardinal'] };
    mergeSightings(existing, { '2026-05-02': ['bluejay'] }, VALID);
    expect(existing['2026-05-02']).toBeUndefined();
  });

  it('adds new dates not in existing', () => {
    const result = mergeSightings({}, { '2026-06-15': ['mockingbird'] }, VALID);
    expect(result['2026-06-15']).toEqual(['mockingbird']);
  });
});
