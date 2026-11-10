import { cn } from '../../lib/format';

export function Field({ label, error, hint, children, className, htmlFor }) {
  return (
    <div className={cn('field', className)}>
      {label ? <label htmlFor={htmlFor} className="label">{label}</label> : null}
      {children}
      {error ? <p className="field-error">{error}</p> : null}
      {hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}
