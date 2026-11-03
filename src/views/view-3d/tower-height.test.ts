import { describe, expect, it } from 'vitest';
import { towerHeight } from './tower-height';

describe('towerHeight', () => {
  it('maps 100 kB to 2 and 10 MB to 8', () => {
    expect(towerHeight(100_000)).toBeCloseTo(2);
    expect(towerHeight(10_000_000)).toBeCloseTo(8);
  });

  it('is 5 at 1 MB (the middle of the log scale)', () => {
    expect(towerHeight(1_000_000)).toBeCloseTo(5);
  });

  it('clamps very small and very large pages', () => {
    expect(towerHeight(0)).toBe(2);
    expect(towerHeight(1_000)).toBe(2);
    expect(towerHeight(500_000_000)).toBe(8);
  });
});
