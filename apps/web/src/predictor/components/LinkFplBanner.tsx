import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const DISMISS_KEY = 'pw-fpl-banner-dismissed';

/** Dismissible nudge shown on My Picks for anyone who skipped linking their FPL team at signup. */
export function LinkFplBanner() {
  const { updateFplTeamId } = useAuth();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Worst case the banner just reappears next visit — not worth failing over.
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateFplTeamId(value.trim());
    } catch {
      setError("Couldn't find that FPL team ID. Double-check it and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-lg p-4" style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)' }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm" style={{ color: 'var(--pw-fg)' }}>
            Link your FPL team to see your stats
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            Your rank, mini-leagues and chip history — right here. Find your ID in the FPL app under Points, it's
            the number in the page URL.
          </p>
        </div>
        <button onClick={dismiss} className="pw-focus shrink-0 text-xs" style={{ color: 'var(--pw-fg-muted)' }} aria-label="Dismiss">
          Dismiss
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="FPL Team ID"
          className="pw-focus flex-1 rounded-lg px-3 py-2 text-sm"
          style={{ background: 'transparent', border: '1px solid var(--pw-border)', color: 'var(--pw-fg)' }}
        />
        <button
          type="submit"
          disabled={submitting}
          className="pw-focus shrink-0 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
          style={{ background: 'var(--pw-accent)', color: 'var(--pw-accent-fg)' }}
        >
          {submitting ? 'Linking…' : 'Link'}
        </button>
      </form>

      {error && (
        <p className="mt-2 text-xs" style={{ color: 'var(--pw-negative)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
