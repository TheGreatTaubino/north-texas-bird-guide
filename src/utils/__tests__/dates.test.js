import { describe, it, expect, vi, afterEach } from 'vitest';
import { getLocalDateKey } from '../dates.js';

describe('getLocalDateKey', () => {
  afterEach(() => vi.useRealTimers());

  it('formats today in YYYY-MM-DD', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 1)); // May 1 2026 local
    expect(getLocalDateKey()).toBe('2026-05-01');
  });

  it('pads single-digit month and day', () => {
    expect(getLocalDateKey(new Date(2026, 0, 9))).toBe('2026-01-09');
  });

  it('uses provided date argument', () => {
    expect(getLocalDateKey(new Date(2025, 11, 31))).toBe('2025-12-31');
  });
});
