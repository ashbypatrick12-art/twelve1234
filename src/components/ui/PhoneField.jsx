import { isValidUgandanPhone, formatPhone } from '../../lib/format';

export function PhoneField({ value, onChange, error, placeholder = '+256 70 000 0000' }) {
  return (
    <div className="field">
      <label htmlFor="phone" className="label">
        Phone number
      </label>
      <input
        id="phone"
        name="phone"
        type="tel"
        inputMode="numeric"
        autoComplete="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`input${error ? ' input--invalid' : ''}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? 'phone-error' : undefined}
      />
      {error ? (
        <p id="phone-error" className="field-error">
          {error}
        </p>
      ) : null}
      <p className="hint">
        Use <kbd className="kbd">0700000000</kbd> or <kbd className="kbd">+256700000000</kbd>
      </p>
    </div>
  );
}
