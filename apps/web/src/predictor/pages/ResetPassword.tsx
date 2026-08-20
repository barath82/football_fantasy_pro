import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BrahmaIcon } from '../components/guru-icons';
import { usePageTitle } from '../hooks/usePageTitle';
import { useAuth } from '../hooks/useAuth';

export function ResetPassword() {
  usePageTitle('Set a new password — FantasyBrahma');
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setFormError("Passwords don't match.");
      return;
    }
    if (!token) {
      setFormError('This reset link is missing its token — please use the link from your email.');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await resetPassword(token, password);
      navigate('/login');
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? 'This reset link is invalid or has expired.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-16 sm:py-24">
      <div className="flex flex-col items-center text-center">
        <BrahmaIcon size={34} style={{ color: 'var(--pw-accent)' }} />
        <h1 className="mt-4 text-3xl">Set a new password</h1>
      </div>

      {!token ? (
        <p className="mt-10 rounded-lg px-4 py-4 text-center text-sm" style={{ background: 'var(--pw-surface)', color: 'var(--pw-negative)' }}>
          This link is missing its token. Please use the link from your email, or{' '}
          <Link to="/forgot-password" className="pw-focus" style={{ color: 'var(--pw-accent)' }}>
            request a new one
          </Link>
          .
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-10 flex flex-col gap-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (min. 8 characters)"
            required
            minLength={8}
            className="pw-focus rounded-lg px-3 py-2.5 text-sm"
            style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)', color: 'var(--pw-fg)' }}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
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
            {submitting ? 'Saving…' : 'Save new password'}
          </button>
        </form>
      )}
    </div>
  );
}
