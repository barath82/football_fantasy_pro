import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User as UserIcon } from 'lucide-react';
import { useAuth, type AuthUser } from '../hooks/useAuth';

function Avatar({ user, size = 28 }: { user: AuthUser; size?: number }) {
  const [imgError, setImgError] = useState(false);

  if (user.avatarUrl && !imgError) {
    return (
      <img
        src={user.avatarUrl}
        onError={() => setImgError(true)}
        alt={user.displayName}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ border: '1px solid var(--pw-border)' }}
      />
    );
  }

  // Photo missing or failed to load (e.g. permission denied) — standard fallback icon.
  return (
    <div
      className="flex items-center justify-center rounded-full"
      style={{ width: size, height: size, background: 'var(--pw-surface-2)', border: '1px solid var(--pw-border)', color: 'var(--pw-fg-muted)' }}
    >
      <UserIcon size={size * 0.55} />
    </div>
  );
}

/** Desktop nav: avatar button that opens a dropdown (My Picks / Account / Logout). */
export function AccountAvatarMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className="pw-focus block rounded-full"
      >
        <Avatar user={user} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-lg"
          style={{ background: 'var(--pw-surface-2)', border: '1px solid var(--pw-border)' }}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              navigate('/my-picks');
            }}
            className="pw-focus block w-full px-3.5 py-2.5 text-left text-sm"
          >
            My Picks
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              navigate('/my-fpl');
            }}
            className="pw-focus block w-full px-3.5 py-2.5 text-left text-sm"
          >
            My FPL Data
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              navigate('/account');
            }}
            className="pw-focus block w-full px-3.5 py-2.5 text-left text-sm"
          >
            Account
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="pw-focus block w-full px-3.5 py-2.5 text-left text-sm"
            style={{ borderTop: '1px solid var(--pw-border)', color: 'var(--pw-negative)' }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

/** Mobile slide-down panel content: avatar + name header, then the same 3 actions stacked. */
export function AccountMobileLinks({ onNavigate }: { onNavigate: () => void }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="pt-2" style={{ borderTop: '1px solid var(--pw-border)' }}>
      <div className="flex items-center gap-2.5 py-2.5">
        <Avatar user={user} size={32} />
        <span className="truncate text-sm font-medium">{user.displayName}</span>
      </div>
      <NavLink to="/my-picks" onClick={onNavigate} className="pw-focus block py-2.5 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
        My Picks
      </NavLink>
      <NavLink to="/my-fpl" onClick={onNavigate} className="pw-focus block py-2.5 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
        My FPL Data
      </NavLink>
      <NavLink to="/account" onClick={onNavigate} className="pw-focus block py-2.5 text-sm" style={{ color: 'var(--pw-fg-muted)' }}>
        Account
      </NavLink>
      <button
        type="button"
        onClick={() => {
          logout();
          onNavigate();
        }}
        className="pw-focus block w-full py-2.5 text-left text-sm"
        style={{ color: 'var(--pw-negative)' }}
      >
        Logout
      </button>
    </div>
  );
}
