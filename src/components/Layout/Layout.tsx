// ============================================================
// MyBirdFinder — Main Navigation / Sidebar Layout
// ============================================================

import { NavLink } from 'react-router-dom';
import { User } from '../../types';
import './Layout.css';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: '🏡' },
  { to: '/log', label: 'Bird Log', icon: '📋' },
  { to: '/add', label: 'Log a Bird', icon: '➕' },
  { to: '/profiles', label: 'Visitor Directory', icon: '🐦' },
  { to: '/stats', label: 'Stats', icon: '📊' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

/** Generate initials avatar from display name */
function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
}

export default function Layout({ children, currentUser, onLogout }: LayoutProps) {
  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">🐦</span>
          <div>
            <div className="brand-name">MyBirdFinder</div>
            <div className="brand-tagline">Your Backyard Journal</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_LINKS.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link--active' : ''}`
              }
            >
              <span className="nav-icon">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User card at bottom of sidebar */}
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials(currentUser.displayName)}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{currentUser.displayName}</div>
            <div className="sidebar-user-handle">@{currentUser.username}</div>
          </div>
          <button
            className="sidebar-logout-btn"
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            ↩
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="mobile-header">
        <span className="brand-icon">🐦</span>
        <span className="brand-name">MyBirdFinder</span>
        <button className="mobile-logout-btn" onClick={onLogout} title="Sign out">
          ↩
        </button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {NAV_LINKS.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `mobile-nav-link ${isActive ? 'mobile-nav-link--active' : ''}`
            }
          >
            <span className="mobile-nav-icon">{link.icon}</span>
            <span className="mobile-nav-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Main content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
