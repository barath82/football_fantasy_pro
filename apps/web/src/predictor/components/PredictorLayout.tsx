import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import { ThemeToggle } from '../theme/ThemeToggle';
import { BrahmaIcon } from './guru-icons';
import { useAuth } from '../hooks/useAuth';
import { AccountAvatarMenu, AccountMobileLinks } from './AccountMenu';
import { identifyUser, trackEvent, trackPageview } from '../../lib/analytics';

const NAV_LINKS = [
  { to: '/challenges', label: 'Challenges' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/scoring', label: 'Scoring' },
  { to: '/about', label: 'About' },
];

function navLinkStyle(isActive: boolean) {
  return {
    color: isActive ? 'var(--pw-fg)' : 'var(--pw-fg-muted)',
    fontWeight: isActive ? 600 : 500,
  };
}

export function PredictorLayout() {
  const { theme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  // Records every page under this layout — Landing, Challenges, Leaderboard,
  // Scoring, About, My Picks, Account, Signup, Login, and the password-reset
  // pages all render through this single Outlet, so one listener here covers
  // all of them. Fires on the initial load too, not just later navigations.
  useEffect(() => {
    trackPageview(location.pathname);
  }, [location.pathname]);

  // Fires the signup/login analytics event exactly once after an OAuth
  // redirect completes (?authed=new|login&authProvider=...), then strips the
  // params so a refresh doesn't re-fire it. Can't detect this from
  // isAuthenticated alone — that's also true on a normal page load with an
  // existing session.
  useEffect(() => {
    const authed = searchParams.get('authed');
    const authProvider = searchParams.get('authProvider');
    if (!authed || !authProvider || !user) return;

    identifyUser({ id: user.id, provider: user.provider });
    trackEvent({
      name: authed === 'new' ? 'signup_completed' : 'login_completed',
      props: { provider: authProvider as 'google' | 'x' },
    });

    const next = new URLSearchParams(searchParams);
    next.delete('authed');
    next.delete('authProvider');
    setSearchParams(next, { replace: true });
  }, [searchParams, user, setSearchParams]);

  return (
    <div className="pw flex min-h-screen flex-col" data-theme={theme}>
      <header className="pw-header">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5 xl:max-w-[998px]">
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
                Sign up / Login
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
          <nav className="mx-auto flex max-w-3xl flex-col gap-1 px-5 pb-4 sm:hidden" style={{ borderTop: '1px solid var(--pw-border)' }}>
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
                Sign up / Login
              </NavLink>
            )}
          </nav>
        )}
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 xl:max-w-[874px]">
        <main className="flex-1">
          <Outlet />
        </main>

        <hr className="pw-divider mt-12" />

        <footer className="py-6 text-center text-xs" style={{ color: 'var(--pw-fg-muted)' }}>
          <p>FantasyBrahma · Not affiliated with the Premier League or Fantasy Premier League.</p>
          <p className="mt-1" style={{ color: 'var(--pw-accent)' }}>
            Got feedback? feedback@gmail.com - we read everything.
          </p>
        </footer>
      </div>
    </div>
  );
}
