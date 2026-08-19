import { useSearchParams } from 'react-router-dom';
import { BrahmaIcon } from '../components/guru-icons';
import { usePageTitle } from '../hooks/usePageTitle';
import { loginUrl } from '../hooks/useAuth';

const ERROR_MESSAGES: Record<string, string> = {
  google_not_configured: "Google sign-in isn't set up yet — check back soon.",
  x_not_configured: "X sign-in isn't set up yet — check back soon.",
  state_mismatch: 'Something went wrong. Please try again.',
  google_failed: 'Google sign-in failed. Please try again.',
  x_failed: 'X sign-in failed. Please try again.',
};

export function Signup() {
  usePageTitle('Sign up — FantasyBrahma');

  const [params] = useSearchParams();
  const returnTo = params.get('returnTo') || '/challenges';
  const error = params.get('error');

  return (
    <div className="mx-auto max-w-md py-16 sm:py-24">
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

        <a
          href={loginUrl('x', returnTo)}
          className="pw-focus w-full rounded-lg px-4 py-4 text-left"
          style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)', display: 'block' }}
        >
          <p className="text-sm">Continue with X</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            Required to show up on the public expert leaderboard.
          </p>
        </a>
      </div>

      <p className="mt-10 text-center text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
        By continuing you agree to play fair and not shout at the fixture computer.
      </p>
    </div>
  );
}
