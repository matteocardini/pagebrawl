import { describe, expect, it } from 'vitest';
import { runMatch } from './run-match';
import type { SiteMetrics } from './types';

function site(
  hostname: string,
  performanceScore: number,
  lcpMs: number,
  totalBytes: number,
  requests: number,
): SiteMetrics {
  return { url: `https://${hostname}/`, hostname, performanceScore, lcpMs, totalBytes, requests };
}

const fast = site('fast.example', 92, 1800, 900_000, 38);
const slow = site('slow.example', 41, 5200, 4_800_000, 140);

describe('runMatch', () => {
  it('example 1: A knocks out B in four rounds', () => {
    const result = runMatch(fast, slow);
    expect(result.rounds.map((r) => r.damage)).toEqual([19, 29, 36, 32]);
    expect(result.rounds.map((r) => r.crit)).toEqual([false, true, true, true]);
    expect(result.rounds.map((r) => r.energyAfter)).toEqual([
      { A: 100, B: 81 },
      { A: 100, B: 52 },
      { A: 100, B: 16 },
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

  it('example 2: identical sites draw with four blocks', () => {
    const result = runMatch(fast, { ...fast });
    expect(result.rounds).toHaveLength(4);
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
    const a = site('a.example', 80, 2000, 1_000_000, 50);
    const b = site('b.example', 70, 2200, 1_100_000, 60);
    const result = runMatch(a, b);
    expect(result.rounds.map((r) => r.damage)).toEqual([4, 3, 3, 6]);
    expect(result.rounds.map((r) => r.energyAfter.B)).toEqual([96, 93, 90, 84]);
    expect(result.rounds.at(-1)?.energyAfter).toEqual({ A: 100, B: 84 });
    expect(result.winner).toBe('A');
    expect(result.finish).toBe('decision');
  });

  it('example 4: an early KO ends the match after three rounds', () => {
    const a = site('a.example', 90, 500, 100_000, 10);
    const b = site('b.example', 9, 5000, 1_000_000, 100);
    const result = runMatch(a, b);
    expect(result.rounds).toHaveLength(3);
    expect(result.rounds.map((r) => r.damage)).toEqual([39, 39, 39]);
    expect(result.rounds.map((r) => r.energyAfter.B)).toEqual([61, 22, 0]);
    expect(result.winner).toBe('A');
    expect(result.finish).toBe('KO');
  });

  it('handles one block round mixed with normal rounds', () => {
    const a = site('a.example', 80, 2000, 1_000_000, 50);
    const b = site('b.example', 70, 2000, 1_100_000, 60);
    const result = runMatch(a, b);
    const blocked = result.rounds[1];
    expect(blocked?.attacker).toBeNull();
    expect(blocked?.damage).toBe(0);
    expect(blocked?.energyAfter).toEqual(result.rounds[0]?.energyAfter);
    expect(result.rounds).toHaveLength(4);
    expect(result.winner).toBe('A');
  });

  it('treats a round where both values are 0 as a block', () => {
    const a = site('a.example', 50, 1000, 0, 10);
    const b = site('b.example', 40, 2000, 0, 20);
    const result = runMatch(a, b);
    const round3 = result.rounds[2];
    expect(round3?.attacker).toBeNull();
    expect(round3?.damage).toBe(0);
  });

  it('applies the minimum damage and clamps a lethal hit at 0 energy', () => {
    const a = site('a.example', 100, 1, 1, 1);
    const tiny = runMatch(site('a.example', 1000, 5, 5, 5), site('b.example', 999, 5, 5, 5));
    expect(tiny.rounds[0]?.damage).toBe(3);
    expect(tiny.rounds[0]?.crit).toBe(false);
    const lethal = runMatch(a, site('b.example', 0, 1000, 1000, 1000));
    expect(lethal.rounds.at(-1)?.energyAfter.B).toBe(0);
    expect(lethal.rounds.at(-1)?.damage).toBeGreaterThan(0);
  });

  it('draws when trades leave energy and performance score equal', () => {
    // B wins Paint Kick (4 damage), A wins Heavy Slam (4 damage); scores are identical.
    const a = site('a.example', 80, 2000, 1000, 10);
    const b = site('b.example', 80, 1750, 1143, 10);
    const result = runMatch(a, b);
    expect(result.rounds.map((r) => r.attacker)).toEqual([null, 'B', 'A', null]);
    expect(result.rounds.at(-1)?.energyAfter).toEqual({ A: 96, B: 96 });
    expect(result.winner).toBe('draw');
    expect(result.finish).toBe('draw');
  });

  it('breaks an energy tie on performanceScore (A higher)', () => {
    // A wins Speed Punch (4 damage), B wins Paint Kick (4 damage): equal energy, A has the higher score.
    const a = site('a.example', 80, 2000, 1000, 10);
    const b = site('b.example', 70, 1750, 1000, 10);
    const result = runMatch(a, b);
    expect(result.rounds.map((r) => r.attacker)).toEqual(['A', 'B', null, null]);
    expect(result.rounds.at(-1)?.energyAfter).toEqual({ A: 96, B: 96 });
    expect(result.winner).toBe('A');
    expect(result.finish).toBe('decision');
  });

  it('breaks an energy tie on performanceScore (B higher)', () => {
    const a = site('a.example', 70, 1750, 1000, 10);
    const b = site('b.example', 80, 2000, 1000, 10);
    const result = runMatch(a, b);
    expect(result.rounds.map((r) => r.attacker)).toEqual(['B', 'A', null, null]);
    expect(result.rounds.at(-1)?.energyAfter).toEqual({ A: 96, B: 96 });
    expect(result.winner).toBe('B');
    expect(result.finish).toBe('decision');
  });

  it('B wins on decision when it has more energy', () => {
    const a = site('a.example', 70, 2000, 1_000_000, 50);
    const b = site('b.example', 80, 1900, 900_000, 40);
    const result = runMatch(a, b);
    expect(result.winner).toBe('B');
    expect(result.finish).toBe('decision');
  });

  it('is deterministic', () => {
    expect(runMatch(fast, slow)).toEqual(runMatch(fast, slow));
  });
});
