import React from 'react';

interface FieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

/**
 * Pembungkus field standar: label jelas, tanda wajib,
 * petunjuk dekat field, error dekat field + aria.
 */
export const Field: React.FC<FieldProps> = ({ label, htmlFor, required, hint, error, children }) => {
  const hintId = hint ? `${htmlFor}-hint` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div>
      <label htmlFor={htmlFor} className={`field-label${required ? ' field-required' : ''}`}>
        {label}
      </label>
      {React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })}
      {hint && !error && <p id={hintId} className="field-hint">{hint}</p>}
      {error && <p id={errorId} role="alert" className="field-error">{error}</p>}
    </div>
  );
};
