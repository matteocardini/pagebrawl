type Props = {
  message: string;
  onBack: () => void;
};

export function ErrorMessage({ message, onBack }: Props) {
  return (
    <div className="panel error-message" role="alert">
      <h2 className="panel__title error-message__title">CONNECTION LOST</h2>
      <p>{message}</p>
      <button type="button" className="btn" onClick={onBack}>
        Back
      </button>
    </div>
  );
}
