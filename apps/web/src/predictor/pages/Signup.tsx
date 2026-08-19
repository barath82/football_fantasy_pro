import { useState } from 'react';
import { BrahmaIcon } from '../components/guru-icons';
import { usePageTitle } from '../hooks/usePageTitle';

const PROVIDERS = [
  { key: 'FPL', label: 'Continue with FPL', body: 'Pulls your team so we can grade picks automatically.' },
  { key: 'Google', label: 'Continue with Google', body: 'Fast sign-in. You can link FPL later.' },
  { key: 'Twitter / X', label: 'Link Twitter / X', body: 'Required to show up on the public expert leaderboard.' },
];

export function Signup() {
  usePageTitle('Sign up — FantasyBrahma');

  const [pending, setPending] = useState<string | null>(null);

  return (
    <div className="py-4">
      <div className="flex flex-col items-center text-center">
        <BrahmaIcon size={30} style={{ color: 'var(--pw-accent)' }} />
        <h1 className="mt-3 text-[1.2375rem]">Become a guru</h1>
        <p className="mt-1 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
          One account, a minute a week. Climb from guru to Brahma as the season plays out.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-2.5">
        {PROVIDERS.map((p) => (
          <div key={p.key}>
            <button
              type="button"
              onClick={() => setPending(p.key)}
              className="pw-focus w-full rounded-lg px-3.5 py-2.5 text-left"
              style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}
            >
              <p className="text-sm font-semibold">{p.label}</p>
              <p className="mt-0.5 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
                {p.body}
              </p>
            </button>
            {pending === p.key && (
              <p className="mt-1.5 pl-1 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
                {p.key} is coming soon.
              </p>
            )}
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
        By continuing you agree to play fair and not shout at the fixture computer.
      </p>
    </div>
  );
}
