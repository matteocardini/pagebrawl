import { ErrorMessage } from './components/ErrorMessage';
import { LoadingScreen } from './components/LoadingScreen';
import { MatchScreen } from './components/MatchScreen';
import { UrlForm } from './components/UrlForm';
import { useMatch } from './state/use-match';

export function App() {
  const { state, lastUrls, start, reset } = useMatch();

  return (
    <main className="app">
      <header className="app__header">
        <h1 className="app__title">PAGE BRAWL</h1>
        <p className="app__tagline">Two websites enter. One leaves faster.</p>
      </header>

      {state.status === 'idle' && <UrlForm initial={lastUrls} onSubmit={start} />}
      {state.status === 'loading' && <LoadingScreen />}
      {state.status === 'error' && <ErrorMessage message={state.message} onBack={reset} />}
      {state.status === 'ready' && <MatchScreen result={state.result} onRematch={reset} />}
    </main>
  );
}
