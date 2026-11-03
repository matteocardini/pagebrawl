export function LoadingScreen() {
  return (
    <div className="panel loading" role="status">
      <h2 className="panel__title">ANALYZING…</h2>
      <div className="loading__bar" aria-hidden="true">
        <span />
      </div>
      <p>Weighing the fighters. Counting every request.</p>
    </div>
  );
}
