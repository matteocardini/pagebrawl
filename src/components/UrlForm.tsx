import { useState } from 'react';
import type { FormEvent } from 'react';
import { normalizeUrl } from '../data/normalize-url';
import type { Urls } from '../state/use-match';

type Props = {
  initial: Urls;
  onSubmit: (urls: Urls) => void;
};

type Errors = { a?: string; b?: string };

export function UrlForm({ initial, onSubmit }: Props) {
  const [a, setA] = useState(initial.a);
  const [b, setB] = useState(initial.b);
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const first = normalizeUrl(a);
    const second = normalizeUrl(b);
    const next: Errors = {};
    if (!first.ok) next.a = first.message;
    if (!second.ok) next.b = second.message;
    setErrors(next);
    if (first.ok && second.ok) onSubmit({ a: first.url, b: second.url });
  }

  return (
    <form className="url-form" onSubmit={handleSubmit} noValidate>
      <UrlField id="url-a" label="Fighter A" side="a" value={a} error={errors.a} onChange={setA} />
      <span className="url-form__vs" aria-hidden="true">
        VS
      </span>
      <UrlField id="url-b" label="Fighter B" side="b" value={b} error={errors.b} onChange={setB} />
      <button type="submit" className="btn btn--primary url-form__fight">
        FIGHT!
      </button>
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  side: 'a' | 'b';
  value: string;
  error: string | undefined;
  onChange: (value: string) => void;
};

function UrlField({ id, label, side, value, error, onChange }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className={`url-field url-field--${side}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        inputMode="url"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="example.com"
        value={value}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <p id={errorId} className="url-field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
