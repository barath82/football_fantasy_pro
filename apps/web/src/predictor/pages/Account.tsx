import { useState } from 'react';
import { User as UserIcon, Pencil, Check } from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useRequireAuth } from '../hooks/useRequireAuth';

function Avatar({ avatarUrl, name }: { avatarUrl: string | null; name: string }) {
  const [imgError, setImgError] = useState(false);
  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        onError={() => setImgError(true)}
        alt={name}
        width={56}
        height={56}
        className="rounded-full object-cover"
        style={{ border: '1px solid var(--pw-border)' }}
      />
    );
  }
  return (
    <div
      className="flex h-14 w-14 items-center justify-center rounded-full"
      style={{ background: 'var(--pw-surface-2)', border: '1px solid var(--pw-border)', color: 'var(--pw-fg-muted)' }}
    >
      <UserIcon size={28} />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b py-3 text-sm" style={{ borderColor: 'var(--pw-border)' }}>
      <span style={{ color: 'var(--pw-fg-muted)' }}>{label}</span>
      <span style={{ color: 'var(--pw-fg)' }}>{value}</span>
    </div>
  );
}

export function Account() {
  usePageTitle('Account — FantasyBrahma');
  const { isLoading: authLoading, isAuthenticated, user, updateFplTeamId } = useRequireAuth('/account');

  const [editingFpl, setEditingFpl] = useState(false);
  const [fplInput, setFplInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading || !isAuthenticated || !user) return null;

  const identityLabel = user.provider === 'x' ? 'X handle' : 'Email';
  const identityValue = user.provider === 'x' ? (user.handle ?? '—') : (user.email ?? '—');

  async function saveFplId() {
    if (!fplInput.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await updateFplTeamId(fplInput.trim());
      setEditingFpl(false);
      setFplInput('');
    } catch {
      setError('Could not save — please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="py-4">
      <h1 className="mt-2 text-[1.2375rem]">Account</h1>

      <div className="mt-6 flex items-center gap-3.5">
        <Avatar avatarUrl={user.avatarUrl} name={user.displayName} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.displayName}</p>
          <p className="mt-0.5 text-xs capitalize" style={{ color: 'var(--pw-fg-muted)' }}>
            Signed in with {user.provider === 'x' ? 'X' : 'Google'}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <InfoRow label={identityLabel} value={identityValue} />

        <div className="py-3">
          <div className="flex items-baseline justify-between text-sm">
            <span style={{ color: 'var(--pw-fg-muted)' }}>FPL Team ID</span>
            {!editingFpl && (
              <button
                type="button"
                onClick={() => {
                  setEditingFpl(true);
                  setFplInput(user.fplTeamId ?? '');
                }}
                className="pw-focus inline-flex items-center gap-1"
                style={{ color: 'var(--pw-accent)' }}
              >
                <Pencil size={12} />
                {user.fplTeamId ? 'Edit' : 'Add'}
              </button>
            )}
          </div>

          {!editingFpl && <p className="mt-1 text-sm" style={{ color: 'var(--pw-fg)' }}>{user.fplTeamId ?? 'Not set'}</p>}

          {editingFpl && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={fplInput}
                onChange={(e) => setFplInput(e.target.value)}
                placeholder="e.g. 1234567"
                autoFocus
                className="pw-focus flex-1 rounded-lg px-3 py-2 text-sm"
                style={{ background: 'var(--pw-surface)', border: '1px solid var(--pw-border)', color: 'var(--pw-fg)' }}
              />
              <button
                type="button"
                onClick={saveFplId}
                disabled={saving || !fplInput.trim()}
                className="pw-focus flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-40"
                style={{ background: 'var(--pw-accent)', color: 'var(--pw-accent-fg)' }}
                aria-label="Save"
              >
                <Check size={16} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingFpl(false);
                  setError(null);
                }}
                className="pw-focus text-xs"
                style={{ color: 'var(--pw-fg-muted)' }}
              >
                Cancel
              </button>
            </div>
          )}
          {error && (
            <p className="mt-1.5 text-xs" style={{ color: 'var(--pw-negative)' }}>
              {error}
            </p>
          )}
          <p className="mt-1.5 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
            Not connected to anything yet — this is just saved for when we can pull your real team automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
