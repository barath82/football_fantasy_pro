import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import { ThemeToggle } from '../theme/ThemeToggle';
import { BrahmaIcon } from './guru-icons';
import { useAuth } from '../hooks/useAuth';
import { AccountAvatarMenu, AccountMobileLinks } from './AccountMenu';

const NAV_LINKS = [
  { to: '/challenges', label: 'Challenges' },
  { to: '/leaderboard', label: 'Leaderboard' },
];

function navLinkStyle(isActive: boolean) {
  return {
    color: isActive ? 'var(--pw-fg)' : 'var(--pw-fg-muted)',
    fontWeight: isActive ? 600 : 500,
  };
}

export function PredictorLayout() {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="pw flex min-h-screen flex-col" data-theme={theme}>
      <header className="pw-header">
        <div className="mx-auto flex max-w-[560px] items-center justify-between px-5 py-3.5">
          <NavLink
            to="/"
            className="pw-display pw-focus flex items-center gap-2 text-base"
            onClick={() => setMenuOpen(false)}
          >
            <BrahmaIcon size={18} style={{ color: 'var(--pw-accent)' }} />
            FantasyBrahma
          </NavLink>

          <nav className="hidden items-center gap-5 sm:flex">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className="pw-focus text-xs" style={({ isActive }) => navLinkStyle(isActive)}>
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <AccountAvatarMenu />
            ) : (
              <NavLink to="/signup" className="pw-focus text-xs" style={({ isActive }) => navLinkStyle(isActive)}>
                Sign up
              </NavLink>
            )}
            <ThemeToggle />
          </nav>

          <div className="flex items-center gap-1 sm:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="pw-focus flex h-9 w-9 items-center justify-center rounded-full"
              style={{ color: 'var(--pw-fg-muted)' }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="mx-auto flex max-w-[560px] flex-col gap-1 px-5 pb-4 sm:hidden" style={{ borderTop: '1px solid var(--pw-border)' }}>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="pw-focus py-2.5 text-sm"
                style={({ isActive }) => navLinkStyle(isActive)}
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <AccountMobileLinks onNavigate={() => setMenuOpen(false)} />
            ) : (
              <NavLink
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="pw-focus py-2.5 text-sm"
                style={({ isActive }) => navLinkStyle(isActive)}
              >
                Sign up
              </NavLink>
            )}
          </nav>
        )}
      </header>

      <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col px-5">
        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="py-6 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
          FantasyBrahma · Not affiliated with the Premier League or Fantasy Premier League.
        </footer>
      </div>
    </div>
  );
}
