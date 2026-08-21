import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BrahmaIcon } from '../components/guru-icons';
import { usePageTitle } from '../hooks/usePageTitle';
import { loginUrl, useAuth } from '../hooks/useAuth';

const ERROR_MESSAGES: Record<string, string> = {
  google_not_configured: "Google sign-in isn't set up yet - check back soon.",
  x_not_configured: "X sign-in isn't set up yet - check back soon.",
  state_mismatch: 'Something went wrong. Please try again.',
  google_failed: 'Google sign-in failed. Please try again.',
  x_failed: 'X sign-in failed. Please try again.',
};

export function Signup() {
  usePageTitle('Sign up - FantasyBrahma');
  const navigate = useNavigate();
  const { register } = useAuth();

  const [params] = useSearchParams();
  const returnTo = params.get('returnTo') || '/challenges';
  const error = params.get('error');

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await register(email, password, displayName);
      navigate(returnTo);
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? 'Could not create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md pt-[35.84px] pb-16 sm:pt-[53.76px] sm:pb-24">
      <div className="flex flex-col items-center text-center">
        <BrahmaIcon size={34} style={{ color: 'var(--pw-accent)' }} />
        <h1 className="mt-4 text-3xl">Become a guru</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
          One account, a minute a week. Climb from guru to Brahma as the season plays out.
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-lg px-3 py-2 text-center text-xs" style={{ background: 'var(--pw-surface)', color: 'var(--pw-negative)' }}>
          {ERROR_MESSAGES[error] ?? 'Something went wrong. Please try again.'}
        </p>
      )}

      <div className="mt-10 flex flex-col gap-3">
        <a
          href={loginUrl('google', returnTo)}
          className="pw-focus w-full rounded-lg px-4 py-4 text-left"
          style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)', display: 'block' }}
        >
          <p className="text-sm">Continue with Google</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            Fast sign-in. You can link FPL later.
          </p>
        </a>
      </div>

      <div className="mt-8 flex items-center gap-3" style={{ color: 'var(--pw-fg-muted)' }}>
        <span className="h-px flex-1" style={{ background: 'var(--pw-border)' }} />
        <span className="text-xs">or</span>
        <span className="h-px flex-1" style={{ background: 'var(--pw-border)' }} />
      </div>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display name"
          required
          maxLength={60}
          className="pw-focus rounded-lg px-3 py-2.5 text-sm"
          style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)', color: 'var(--pw-fg)' }}
        />
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
          placeholder="Password (min. 8 characters)"
          required
          minLength={8}
          className="pw-focus rounded-lg px-3 py-2.5 text-sm"
          style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)', color: 'var(--pw-fg)' }}
        />
        {formError && (
          <p className="text-xs" style={{ color: 'var(--pw-negative)' }}>
            {formError}
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="pw-focus mt-1 w-full rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-50"
          style={{ background: 'var(--pw-accent)', color: 'var(--pw-accent-fg)' }}
        >
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
        Already have an account?{' '}
        <Link to={`/login?returnTo=${encodeURIComponent(returnTo)}`} className="pw-focus" style={{ color: 'var(--pw-accent)' }}>
          Log in
        </Link>
      </p>

      <p className="mt-8 text-center text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
        By continuing you agree to play fair and not shout at the fixture computer.
      </p>
    </div>
  );
}
