import { describe, expect, it } from 'vitest';
import { formatMegabytes, formatMetric, formatSeconds } from './format';

describe('format', () => {
  it('formats milliseconds as seconds', () => {
    expect(formatSeconds(1800)).toBe('1.8 s');
    expect(formatSeconds(5249)).toBe('5.2 s');
  });

  it('formats bytes as megabytes', () => {
    expect(formatMegabytes(900_000)).toBe('0.9 MB');
    expect(formatMegabytes(7_500_000)).toBe('7.5 MB');
  });
});

describe('formatMetric', () => {
  it('formats each metric the way the result card shows it', () => {
    expect(formatMetric('performanceScore', 92)).toBe('92');
    expect(formatMetric('lcpMs', 1800)).toBe('1.8 s');
    expect(formatMetric('totalBytes', 900_000)).toBe('0.9 MB');
    expect(formatMetric('requests', 38)).toBe('38');
  });
});
