import type { InputHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string | null;
};

export function Input({ label, hint, error, id, className = '', ...rest }: InputProps) {
  const inputId = id ?? rest.name;
  return (
    <div className={`vb-field ${className}`.trim()}>
      {label ? (
        <label className="vb-field__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input id={inputId} className={`vb-input ${error ? 'vb-input--error' : ''}`.trim()} {...rest} />
      {hint && !error ? <p className="vb-field__hint">{hint}</p> : null}
      {error ? <p className="vb-field__error">{error}</p> : null}
    </div>
  );
}
