import { describe, expect, it } from 'vitest';
import { formatBytes, formatMegabytes, formatMetric, formatSeconds } from './format';

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

describe('formatBytes', () => {
  it('uses kB below 1 MB and MB above', () => {
    expect(formatBytes(2_324)).toBe('2.3 kB');
    expect(formatBytes(9_999)).toBe('10.0 kB');
    expect(formatBytes(10_000)).toBe('10 kB');
    expect(formatBytes(900_000)).toBe('900 kB');
    expect(formatBytes(1_000_000)).toBe('1.0 MB');
    expect(formatBytes(7_500_000)).toBe('7.5 MB');
  });
});

describe('formatMetric', () => {
  it('formats each metric the way the result card shows it', () => {
    expect(formatMetric('performanceScore', 92)).toBe('92');
    expect(formatMetric('lcpMs', 1800)).toBe('1.8 s');
    expect(formatMetric('totalBytes', 900_000)).toBe('900 kB');
    expect(formatMetric('totalBytes', 2_324)).toBe('2.3 kB');
    expect(formatMetric('totalBytes', 1_460_000)).toBe('1.5 MB');
    expect(formatMetric('requests', 38)).toBe('38');
    expect(formatMetric('tbtMs', 120)).toBe('120 ms');
    expect(formatMetric('cls', 0.02)).toBe('0.02');
    expect(formatMetric('cls', 0)).toBe('0');
    expect(formatMetric('cls', 0.12345)).toBe('0.123');
  });
});
