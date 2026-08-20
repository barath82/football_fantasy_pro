import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BrahmaIcon } from '../components/guru-icons';
import { usePageTitle } from '../hooks/usePageTitle';
import { loginUrl, useAuth } from '../hooks/useAuth';

export function Login() {
  usePageTitle('Log in — FantasyBrahma');
  const navigate = useNavigate();
  const { login } = useAuth();

  const [params] = useSearchParams();
  const returnTo = params.get('returnTo') || '/challenges';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await login(email, password);
      navigate(returnTo);
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? 'Incorrect email or password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-16 sm:py-24">
      <div className="flex flex-col items-center text-center">
        <BrahmaIcon size={34} style={{ color: 'var(--pw-accent)' }} />
        <h1 className="mt-4 text-3xl">Welcome back</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
          Log in to see your picks and where you stand.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-3">
        <a
          href={loginUrl('google', returnTo)}
          className="pw-focus w-full rounded-lg px-4 py-4 text-left"
          style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)', display: 'block' }}
        >
          <p className="text-sm">Continue with Google</p>
        </a>
      </div>

      <div className="mt-8 flex items-center gap-3" style={{ color: 'var(--pw-fg-muted)' }}>
        <span className="h-px flex-1" style={{ background: 'var(--pw-border)' }} />
        <span className="text-xs">or</span>
        <span className="h-px flex-1" style={{ background: 'var(--pw-border)' }} />
      </div>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="pw-focus rounded-lg px-3 py-2.5 text-sm"
          style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)', color: 'var(--pw-fg)' }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="pw-focus rounded-lg px-3 py-2.5 text-sm"
          style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)', color: 'var(--pw-fg)' }}
        />
        {formError && (
          <p className="text-xs" style={{ color: 'var(--pw-negative)' }}>
            {formError}
          </p>
        )}
        <div className="flex justify-end">
          <Link to="/forgot-password" className="pw-focus text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="pw-focus mt-1 w-full rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-50"
          style={{ background: 'var(--pw-accent)', color: 'var(--pw-accent-fg)' }}
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
        New here?{' '}
        <Link to={`/signup?returnTo=${encodeURIComponent(returnTo)}`} className="pw-focus" style={{ color: 'var(--pw-accent)' }}>
          Create an account
        </Link>
      </p>
    </div>
  );
}
