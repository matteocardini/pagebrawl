import { describe, expect, it } from 'vitest';
import { ROUND_DEFINITIONS } from './constants';
import { runMatch } from './run-match';
import type { SiteMetrics } from './types';

function site(
  hostname: string,
  performanceScore: number,
  lcpMs: number,
  totalBytes: number,
  requests: number,
  tbtMs = 0,
  cls = 0,
): SiteMetrics {
  return { url: `https://${hostname}/`, hostname, performanceScore, lcpMs, totalBytes, requests, tbtMs, cls };
}

const fast = site('fast.example', 92, 1800, 900_000, 38, 120, 0.02);
const slow = site('slow.example', 41, 5200, 4_800_000, 140, 1400, 0.35);

describe('runMatch', () => {
  it('plays six rounds in a fixed order', () => {
    expect(ROUND_DEFINITIONS.map((r) => r.metricKey)).toEqual([
      'performanceScore',
      'lcpMs',
      'totalBytes',
      'requests',
      'tbtMs',
      'cls',
    ]);
    expect(runMatch(fast, fast).rounds).toHaveLength(6);
  });

  it('example 1: A knocks out B in round 5 and round 6 is not played', () => {
    const result = runMatch(fast, slow);
    expect(result.rounds).toHaveLength(5);
    expect(result.rounds.map((r) => r.damage)).toEqual([14, 20, 25, 23, 29]);
    expect(result.rounds.map((r) => r.crit)).toEqual([false, true, true, true, true]);
    expect(result.rounds.map((r) => r.energyAfter)).toEqual([
      { A: 100, B: 86 },
      { A: 100, B: 66 },
      { A: 100, B: 41 },
      { A: 100, B: 18 },
      { A: 100, B: 0 },
    ]);
    expect(result.rounds.every((r) => r.attacker === 'A')).toBe(true);
    expect(result.winner).toBe('A');
    expect(result.finish).toBe('KO');
  });

  it('example 1 mirrored: B wins when roles are swapped', () => {
    const result = runMatch(slow, fast);
    expect(result.winner).toBe('B');
    expect(result.finish).toBe('KO');
    expect(result.rounds.at(-1)?.energyAfter).toEqual({ A: 0, B: 100 });
  });

  it('example 2: identical sites draw with six blocks', () => {
    const result = runMatch(fast, { ...fast });
    expect(result.rounds).toHaveLength(6);
    for (const round of result.rounds) {
      expect(round.attacker).toBeNull();
      expect(round.damage).toBe(0);
      expect(round.crit).toBe(false);
      expect(round.energyAfter).toEqual({ A: 100, B: 100 });
    }
    expect(result.winner).toBe('draw');
    expect(result.finish).toBe('draw');
  });

  it('example 3: A wins on decision with small advantages', () => {
    const a = site('a.example', 80, 2000, 1_000_000, 50, 300, 0.12);
    const b = site('b.example', 70, 2200, 1_100_000, 60, 350, 0.15);
    const result = runMatch(a, b);
    expect(result.rounds).toHaveLength(6);
    expect(result.rounds.map((r) => r.damage)).toEqual([3, 3, 3, 4, 4, 5]);
    expect(result.rounds.map((r) => r.energyAfter.B)).toEqual([97, 94, 91, 87, 83, 78]);
    expect(result.rounds.at(-1)?.energyAfter).toEqual({ A: 100, B: 78 });
    expect(result.winner).toBe('A');
    expect(result.finish).toBe('decision');
  });

  it('example 4: an early KO ends the match after four rounds', () => {
    const a = site('a.example', 90, 500, 100_000, 10, 50, 0.01);
    const b = site('b.example', 9, 5000, 1_000_000, 100, 2000, 0.9);
    const result = runMatch(a, b);
    expect(result.rounds).toHaveLength(4);
    expect(result.rounds.map((r) => r.damage)).toEqual([28, 28, 28, 28]);
    expect(result.rounds.map((r) => r.energyAfter.B)).toEqual([72, 44, 16, 0]);
    expect(result.winner).toBe('A');
    expect(result.finish).toBe('KO');
  });

  it('example 5: the floor tames tiny differences on TBT and CLS', () => {
    const base = site('a.example', 80, 2000, 1_000_000, 50, 10, 0);
    const tbt = runMatch(base, { ...base, hostname: 'b.example', tbtMs: 20 }).rounds[4];
    expect(tbt).toMatchObject({ moveId: 'freeze-ray', attacker: 'A', damage: 3, crit: false });
    const cls = runMatch(base, { ...base, hostname: 'b.example', cls: 0.05 }).rounds[5];
    expect(cls).toMatchObject({ moveId: 'shake-quake', attacker: 'A', damage: 13, crit: false });
  });

  it('a large gap on TBT or CLS still hits critically', () => {
    const base = site('a.example', 80, 2000, 1_000_000, 50, 0, 0);
    const result = runMatch(base, { ...base, hostname: 'b.example', tbtMs: 2000, cls: 0.5 });
    // advantage is 1 in both rounds: 25 x 1.25 = 31.25, the largest possible hit
    expect(result.rounds[4]).toMatchObject({ attacker: 'A', damage: 31, crit: true });
    expect(result.rounds[5]).toMatchObject({ attacker: 'A', damage: 31, crit: true });
  });

  it('handles one block round mixed with normal rounds', () => {
    const a = site('a.example', 80, 2000, 1_000_000, 50);
    const b = site('b.example', 70, 2000, 1_100_000, 60);
    const result = runMatch(a, b);
    const blocked = result.rounds[1];
    expect(blocked?.attacker).toBeNull();
    expect(blocked?.damage).toBe(0);
    expect(blocked?.energyAfter).toEqual(result.rounds[0]?.energyAfter);
    expect(result.rounds).toHaveLength(6);
    expect(result.winner).toBe('A');
  });

  it('treats a round where both values are 0 as a block', () => {
    const a = site('a.example', 50, 1000, 0, 10);
    const b = site('b.example', 40, 2000, 0, 20);
    const round3 = runMatch(a, b).rounds[2];
    expect(round3?.attacker).toBeNull();
    expect(round3?.damage).toBe(0);
  });

  it('applies the minimum damage and clamps a lethal hit at 0 energy', () => {
    const tiny = runMatch(site('a.example', 1000, 5, 5, 5), site('b.example', 999, 5, 5, 5));
    expect(tiny.rounds[0]?.damage).toBe(3);
    expect(tiny.rounds[0]?.crit).toBe(false);
    const lethal = runMatch(
      site('a.example', 100, 1, 1, 1, 0, 0),
      site('b.example', 0, 1000, 1000, 1000, 3000, 1),
    );
    expect(lethal.rounds.map((r) => r.energyAfter.B)).toEqual([69, 38, 7, 0]);
    expect(lethal.rounds.at(-1)?.damage).toBe(31);
  });

  it('draws when trades leave energy and performance score equal', () => {
    // B wins Paint Kick (3 damage), A wins Heavy Slam (3 damage); scores are identical.
    const a = site('a.example', 80, 2000, 1000, 10);
    const b = site('b.example', 80, 1750, 1143, 10);
    const result = runMatch(a, b);
    expect(result.rounds.map((r) => r.attacker)).toEqual([null, 'B', 'A', null, null, null]);
    expect(result.rounds.at(-1)?.energyAfter).toEqual({ A: 97, B: 97 });
    expect(result.winner).toBe('draw');
    expect(result.finish).toBe('draw');
  });

  it('breaks an energy tie on performanceScore (A higher)', () => {
    // A wins Speed Punch (3 damage), B wins Paint Kick (3 damage): equal energy, A has the higher score.
    const a = site('a.example', 80, 2000, 1000, 10);
    const b = site('b.example', 70, 1750, 1000, 10);
    const result = runMatch(a, b);
    expect(result.rounds.map((r) => r.attacker)).toEqual(['A', 'B', null, null, null, null]);
    expect(result.rounds.at(-1)?.energyAfter).toEqual({ A: 97, B: 97 });
    expect(result.winner).toBe('A');
    expect(result.finish).toBe('decision');
  });

  it('breaks an energy tie on performanceScore (B higher)', () => {
    const a = site('a.example', 70, 1750, 1000, 10);
    const b = site('b.example', 80, 2000, 1000, 10);
    const result = runMatch(a, b);
    expect(result.rounds.map((r) => r.attacker)).toEqual(['B', 'A', null, null, null, null]);
    expect(result.rounds.at(-1)?.energyAfter).toEqual({ A: 97, B: 97 });
    expect(result.winner).toBe('B');
    expect(result.finish).toBe('decision');
  });

  it('B wins on decision when it has more energy', () => {
    const a = site('a.example', 70, 2000, 1_000_000, 50);
    const b = site('b.example', 80, 1900, 900_000, 40);
    const result = runMatch(a, b);
    expect(result.rounds.at(-1)?.energyAfter).toEqual({ A: 86, B: 100 });
    expect(result.winner).toBe('B');
    expect(result.finish).toBe('decision');
  });

  it('is deterministic', () => {
    expect(runMatch(fast, slow)).toEqual(runMatch(fast, slow));
  });
});
