import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrahmaIcon } from '../components/guru-icons';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../hooks/useAuth';

export function ForgotPassword() {
  usePageTitle('Reset password — FantasyBrahma');
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await forgotPassword(email);
    } finally {
      // Always show the same success state, whether or not the email is
      // registered — otherwise this endpoint becomes a way to check who has
      // an account.
      setSubmitting(false);
      setSent(true);
    }
  }

  return (
    <div className="mx-auto max-w-md pt-[35.84px] pb-16 sm:pt-[53.76px] sm:pb-24">
      <div className="flex flex-col items-center text-center">
        <BrahmaIcon size={34} style={{ color: 'var(--pw-accent)' }} />
        <h1 className="mt-4 text-3xl">Reset your password</h1>
        <p className="mt-2 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
          Enter the email on your account and we'll send you a reset link.
        </p>
      </div>

      {sent ? (
        <p className="mt-10 rounded-lg px-4 py-4 text-center text-sm" style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}>
          If an account exists for that email, a reset link is on its way. Check your inbox.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="pw-focus rounded-lg px-3 py-2.5 text-sm"
            style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)', color: 'var(--pw-fg)' }}
          />
          <button
            type="submit"
            disabled={submitting}
            className="pw-focus mt-1 w-full rounded-lg px-4 py-3 text-sm font-semibold disabled:opacity-50"
            style={{ background: 'var(--pw-accent)', color: 'var(--pw-accent-fg)' }}
          >
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
        <Link to="/login" className="pw-focus" style={{ color: 'var(--pw-accent)' }}>
          Back to log in
        </Link>
      </p>
    </div>
  );
}
