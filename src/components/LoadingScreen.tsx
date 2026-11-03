import { useEffect, useState } from 'react';

export const SLOW_AFTER_MS = 20_000;

export function LoadingScreen() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="panel loading" role="status">
      <h2 className="panel__title">ANALYZING…</h2>
      <div className="loading__bar" aria-hidden="true">
        <span />
      </div>
      <p>Weighing the fighters. Counting every request.</p>
      {slow && <p className="loading__slow">Taking longer than usual… heavy pages can need up to 30 seconds.</p>}
    </div>
  );
}
