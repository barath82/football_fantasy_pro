import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import { ThemeToggle } from '../theme/ThemeToggle';

const NAV_LINKS = [
  { to: '/challenges', label: 'Challenges' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/signup', label: 'Sign up' },
];

function navLinkStyle(isActive: boolean) {
  return {
    color: isActive ? 'var(--pw-fg)' : 'var(--pw-fg-muted)',
    fontWeight: isActive ? 600 : 500,
  };
}

export function PredictorLayout() {
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="pw" data-theme={theme}>
      <div className="mx-auto flex min-h-screen max-w-[560px] flex-col px-5">
        <header className="flex items-center justify-between py-4">
          <NavLink to="/" className="pw-display pw-focus text-base" onClick={() => setMenuOpen(false)}>
            Pitchwise
          </NavLink>

          <nav className="hidden items-center gap-5 sm:flex">
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} className="pw-focus text-xs" style={({ isActive }) => navLinkStyle(isActive)}>
                {link.label}
              </NavLink>
            ))}
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
        </header>

        {menuOpen && (
          <nav className="flex flex-col gap-1 pb-4 sm:hidden" style={{ borderTop: '1px solid var(--pw-border)' }}>
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
          </nav>
        )}

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="py-6 text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
          © 2026 Pitchwise. Built for FPL obsessives.
        </footer>
      </div>
    </div>
  );
}
