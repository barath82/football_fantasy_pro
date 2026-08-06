import { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Home, Compass, Users, Globe, TrendingUp, BarChart2, Menu, X, Zap } from 'lucide-react';
import { useHubStore } from '../../store/hub.store';

const NAV_ITEMS = [
  { label: 'GW Hub', path: '/', icon: Home, end: true },
  { label: 'Explore', path: '/explore', icon: Compass, end: false },
  { label: 'Players', path: '/intelligence/players', icon: Users, end: false },
  { label: 'Sources', path: '/sources', icon: Globe, end: false },
  { label: 'Trending', path: '/trending', icon: TrendingUp, end: false },
];

const GWS = [1, 2, 3, 4, 5];

export function HubLayout() {
  const { selectedGW, setSelectedGW } = useHubStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="hub-root min-h-screen bg-slate-900 text-slate-100">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 shadow-sm shadow-black/30">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-14 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 mr-2">
            <div className="w-7 h-7 bg-violet-500 rounded-lg flex items-center justify-center shadow-md shadow-violet-900/40">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">
              ARBA<span className="text-slate-400 font-normal ml-1">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-slate-700/70 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`
                }
              >
                <item.icon size={13} />
                {item.label}
              </NavLink>
            ))}

            <div className="w-px h-4 bg-slate-700 mx-2" />

            <a
              href="/players"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
              title="FPL Statistics Dashboard"
            >
              <BarChart2 size={13} />
              FPL Stats
            </a>
          </nav>

          {/* GW Selector */}
          <div className="flex items-center bg-slate-800 border border-slate-700/60 rounded-lg p-0.5 gap-0.5 shrink-0 shadow-inner shadow-black/20">
            {GWS.map(gw => (
              <button
                key={gw}
                onClick={() => setSelectedGW(gw)}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
                  selectedGW === gw
                    ? 'bg-violet-500 text-white shadow-sm shadow-violet-900/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                }`}
              >
                GW{gw}
              </button>
            ))}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-slate-400 hover:text-slate-200 ml-auto p-1 transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-700/50 bg-slate-900 px-4 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? 'bg-slate-700/70 text-white font-medium'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`
                }
              >
                <item.icon size={15} />
                {item.label}
              </NavLink>
            ))}
            <div className="border-t border-slate-700/50 mt-1 pt-2">
              <a
                href="/players"
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-slate-800 transition-all"
              >
                <BarChart2 size={15} />
                FPL Stats
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="min-h-[calc(100vh-56px-72px)]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-16 bg-slate-900/60">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-violet-500 rounded flex items-center justify-center shadow shadow-violet-900/30">
              <Zap size={10} className="text-white" />
            </div>
            <span className="text-slate-400 text-xs font-medium">ARBA Hub</span>
            <span className="text-slate-600 text-xs">· Fantasy Content Intelligence</span>
          </div>
          <p className="text-slate-500 text-[11px] text-center md:text-right max-w-md leading-relaxed">
            All original content belongs to the respective creators and publishers. This platform organizes
            and curates publicly available fantasy football content.
          </p>
        </div>
      </footer>
    </div>
  );
}
