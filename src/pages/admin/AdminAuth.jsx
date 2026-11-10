import { ArrowRight, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { loginAdmin, isAdminAuthed } from '../../lib/store';
import { Button } from '../../components/ui/Button';

const DEMO_PASSCODE = '2026';

export function AdminAuth() {
  const navigate = useNavigate();
  const [entered, setEntered] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (entered === DEMO_PASSCODE) {
        loginAdmin();
        if (!isAdminAuthed()) throw new Error("Session unavailable");
        navigate('/admin/overview', { replace: true });
      } else {
        setError('That code is not right. The demo code is shown on the desk.');
        setSubmitting(false);
      }
    } catch {
      setError('Unable to open your session. Allow browser session storage and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isAdminAuthed()) return <Navigate to="/admin/overview" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory px-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#40513d] text-white flex items-center justify-center shadow-lg shadow-[#40513d]/15">
            <LockKeyhole className="w-6 h-6 shrink-0" strokeWidth={1.7} aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl mt-4">Gency Bookings</h1>
          <p className="text-sm text-muted mt-1">Serene Beauty Studio · manager view</p>
        </div>

        <div className="rounded-[28px] border border-[#e5e8df] bg-white p-6 sm:p-9 shadow-[0_20px_60px_-30px_rgba(38,48,35,0.28)]">
          <div className="mb-6"><p className="text-base font-semibold text-[#303a2e]">Welcome back</p><p className="mt-1 text-sm leading-6 text-muted">
            Demo access only. This is a demonstration MVP — no production authentication.
          </p></div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="passcode" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#747d70]">
                Demo passcode
              </label>
              <input
                id="passcode"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                value={entered}
                onChange={(e) => setEntered(e.target.value)}
                placeholder="Enter code"
                className="mt-2 w-full rounded-xl border border-[#dfe4da] bg-[#fbfcfa] px-4 py-3.5 text-base tracking-[0.18em] transition placeholder:tracking-normal focus:border-[#718269] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#718269]/10"
                autoFocus
                disabled={submitting}
              />
            </div>
            {error ? <p role="alert" className="text-sm text-amber-700">{error}</p> : null}
            <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
              {submitting ? 'Opening…' : <>Enter dashboard <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" /></>}
            </Button>
          </form>

          <p className="mt-5 rounded-xl bg-[#f7f8f5] p-3 text-xs leading-5 text-muted">
            Demo code: <span className="font-mono font-semibold text-sage">2026</span>
            <br />
            (shared across everyone — designed for this demonstration environment only)
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Dashboard: <span className="font-mono">/admin</span>
        </p>
      </div>
    </div>
  );
}
