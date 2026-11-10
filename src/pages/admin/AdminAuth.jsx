import { Sparkles } from 'lucide-react';
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
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-sage text-white flex items-center justify-center">
            <Sparkles className="w-[22px] h-[22px] shrink-0" aria-hidden="true" />
          </div>
          <h1 className="font-display text-2xl mt-4">Gency Bookings</h1>
          <p className="text-sm text-muted mt-1">Serene Beauty Studio · manager view</p>
        </div>

        <div className="rounded-3xl border border-line/70 bg-white p-6 sm:p-8 shadow-soft">
          <p className="text-sm text-muted mb-5">
            Demo access only. This is a demonstration MVP — no production authentication.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="passcode" className="label">
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
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm transition focus:border-sage focus:outline-none focus-visible:ring-2 focus-visible:ring-sage/20"
                autoFocus
                disabled={submitting}
              />
            </div>
            {error ? <p role="alert" className="text-sm text-amber-700">{error}</p> : null}
            <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
              {submitting ? 'Opening…' : `Enter ${DEMO_PASSCODE}`}
            </Button>
          </form>

          <p className="mt-5 text-xs text-muted">
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
