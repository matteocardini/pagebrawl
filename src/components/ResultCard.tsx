import { useState } from 'react';
import type { FighterId, MatchResult, MetricKey } from '../engine/types';
import { buildChallengeLink } from '../state/challenge-link';
import { copyText, shareLink } from '../state/share';
import type { ShareOutcome } from '../state/share';
import { formatMegabytes, formatMetric, formatSeconds } from './format';
import './result-card.css';

type Row = { key: MetricKey; label: string; format: (value: number) => string };

const ROWS: readonly Row[] = [
  { key: 'performanceScore', label: 'Score', format: String },
  { key: 'lcpMs', label: 'LCP', format: formatSeconds },
  { key: 'totalBytes', label: 'Weight', format: formatMegabytes },
  { key: 'requests', label: 'Requests', format: String },
  { key: 'tbtMs', label: 'Blocking', format: (value) => formatMetric('tbtMs', value) },
  { key: 'cls', label: 'Layout shift', format: (value) => formatMetric('cls', value) },
];

const STATUS_TEXT: Record<ShareOutcome | 'idle', string> = {
  idle: '',
  shared: 'Shared!',
  copied: 'Link copied!',
  cancelled: '',
  failed: "Couldn't copy automatically. Copy the link below:",
};

function finishLabel(result: MatchResult): string {
  if (result.finish === 'KO') return 'K.O.';
  return result.finish === 'draw' ? 'DRAW' : 'DECISION';
}

export function ResultCard({ result }: { result: MatchResult }) {
  const [status, setStatus] = useState<ShareOutcome | 'idle'>('idle');
  const { A, B } = result.fighters;
  const link = buildChallengeLink(`${window.location.origin}${window.location.pathname}`, { a: A.url, b: B.url });
  const loser: FighterId | null = result.winner === 'draw' ? null : result.winner === 'A' ? 'B' : 'A';
  const shareText =
    result.winner === 'draw' || !loser
      ? `${A.hostname} vs ${B.hostname} ended in a draw on Page Brawl.`
      : `${result.fighters[result.winner].hostname} beat ${result.fighters[loser].hostname} on Page Brawl (${finishLabel(result)}).`;

  // the round that was fought on a metric tells who won it (absent after an early K.O.)
  const roundWinner = (key: MetricKey) => result.rounds.find((round) => round.metricKey === key)?.attacker ?? null;

  return (
    <section className="result" aria-label="Match result">
      <p className="result__finish">{finishLabel(result)}</p>
      <h2 className="result__winner">
        {result.winner === 'draw' ? "IT'S A DRAW" : `${result.fighters[result.winner].hostname} WINS`}
      </h2>

      <table className="result__table">
        <thead>
          <tr>
            <th scope="col">
              <span className="sr-only">Metric</span>
            </th>
            <th scope="col" className="result__a" title={A.hostname}>
              {A.hostname}
            </th>
            <th scope="col" className="result__b" title={B.hostname}>
              {B.hostname}
            </th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.key}>
              <th scope="row">{row.label}</th>
              <td className={roundWinner(row.key) === 'A' ? 'result__best' : undefined}>{row.format(A[row.key])}</td>
              <td className={roundWinner(row.key) === 'B' ? 'result__best' : undefined}>{row.format(B[row.key])}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="result__actions">
        <button type="button" className="btn" onClick={async () => setStatus((await copyText(link)) ? 'copied' : 'failed')}>
          Copy challenge link
        </button>
        <button
          type="button"
          className="btn"
          onClick={async () => setStatus(await shareLink({ title: 'Page Brawl', text: shareText, url: link }))}
        >
          Share
        </button>
      </div>
      <p className="result__status" role="status">
        {STATUS_TEXT[status]}
      </p>
      {status === 'failed' && (
        <input className="result__link" readOnly value={link} aria-label="Challenge link" onFocus={(event) => event.target.select()} />
      )}
    </section>
  );
}
