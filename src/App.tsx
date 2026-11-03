import { useEffect, useRef, useState } from 'react';
import { ErrorMessage } from './components/ErrorMessage';
import { LoadingScreen } from './components/LoadingScreen';
import { MatchScreen } from './components/MatchScreen';
import { UrlForm } from './components/UrlForm';
import { ViewToggle } from './components/ViewToggle';
import { normalizeUrl } from './data/normalize-url';
import { parseChallengeParams } from './state/challenge-link';
import { useMatch } from './state/use-match';
import { useViewMode } from './state/use-view-mode';

export function App() {
  // a shared link (?a=...&b=...) pre-fills the form and starts the match
  const [challenge] = useState(() => parseChallengeParams(window.location.search));
  const { state, lastUrls, start, reset } = useMatch(challenge ?? undefined);
  const { mode, setMode, webgl } = useViewMode(state.status !== 'idle');
  const autostarted = useRef(false);

  useEffect(() => {
    if (!challenge || autostarted.current) return;
    autostarted.current = true;
    const a = normalizeUrl(challenge.a);
    const b = normalizeUrl(challenge.b);
    if (a.ok && b.ok) void start({ a: a.url, b: b.url });
  }, [challenge, start]);

  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">PAGE BRAWL</h1>
        <p className="app__tagline">Two websites enter. One leaves faster.</p>
      </header>

      <ViewToggle mode={mode} webgl={webgl} onChange={setMode} />

      {state.status === 'idle' && <UrlForm initial={lastUrls} onSubmit={start} />}
      {state.status === 'loading' && <LoadingScreen />}
      {state.status === 'error' && <ErrorMessage message={state.message} onBack={reset} />}
      {state.status === 'ready' && <MatchScreen result={state.result} mode={mode} onRematch={reset} />}
    </main>
  );
}
