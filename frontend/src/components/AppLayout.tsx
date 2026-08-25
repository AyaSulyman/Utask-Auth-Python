'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Icon, IconButton, type IconName } from './ui';

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

const navItemsByRole: Record<'client' | 'admin', NavItem[]> = {
  client: [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/profile', label: 'My Profile', icon: 'user' },
    { to: '/stats', label: 'Statistics', icon: 'stats' },
  ],
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/admin/users', label: 'Manage Users', icon: 'users' },
    { to: '/profile', label: 'My Profile', icon: 'user' },
    { to: '/stats', label: 'Statistics', icon: 'stats' },
  ],
};

function LogoutButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="ut-btn ut-btn-ghost"
      style={{
        background: 'transparent',
        border: '1.5px solid var(--border-strong)',
        borderRadius: 'var(--radius-pill)',
        padding: '9px 18px',
        fontWeight: 700,
        fontSize: 13,
        color: 'var(--text-primary)',
      }}
    >
      <Icon name="logout" size={14} />
      Log out
    </button>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const items = navItemsByRole[isAdmin ? 'admin' : 'client'];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 252,
          flexShrink: 0,
          background: 'var(--bg-sidebar)',
          padding: '26px 18px',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--border-subtle)',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 30, paddingLeft: 8 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            u
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19 }}>
            uTask
          </span>
        </div>

        <button
          onClick={() => router.push(isAdmin ? '/admin/users' : '/profile')}
          className="ut-btn"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '13px 16px',
            justifyContent: 'space-between',
            fontWeight: 700,
            fontSize: 13.5,
            marginBottom: 24,
            boxShadow: 'var(--shadow-card)',
            color: 'var(--text-primary)',
          }}
        >
          {isAdmin ? 'Create user' : 'View profile'}
          <span
            style={{
              background: 'var(--grad-primary)',
              color: '#fff',
              width: 24,
              height: 24,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={isAdmin ? 'plus' : 'arrow-up-right'} size={13} />
          </span>
        </button>

        <div style={{ padding: '0 10px', marginBottom: 10 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            Menu
          </span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          {items.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                href={item.to}
                className={`ut-navlink${isActive ? ' ut-navlink--active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600,
                  fontSize: 14,
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  background: isActive ? 'var(--grad-primary)' : 'transparent',
                  boxShadow: isActive ? 'var(--shadow-glow)' : 'none',
                }}
              >
                <Icon name={item.icon} size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            background: 'var(--grad-primary)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            color: '#fff',
            marginTop: 20,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              right: -30,
              top: -30,
            }}
          />
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Icon name="shield" size={16} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14.5 }}>
                {isAdmin ? 'Admin console' : 'Stay on track'}
              </span>
            </div>
            <div style={{ fontSize: 12.5, opacity: 0.9, lineHeight: 1.5, marginBottom: 14 }}>
              {isAdmin
                ? 'Manage every client and admin account from one place.'
                : 'Keep your profile up to date so your team can reach you.'}
            </div>
            <button
              onClick={toggleTheme}
              className="ut-btn"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                borderRadius: 'var(--radius-pill)',
                padding: '9px 16px',
                fontWeight: 700,
                fontSize: 12.5,
              }}
            >
              <Icon name={theme === 'light' ? 'moon' : 'sun'} size={13.5} />
              Switch to {theme === 'light' ? 'dark' : 'light'} mode
            </button>
          </div>
        </div>
      </aside>

     {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 32px',
            borderBottom: '1px solid var(--border-subtle)',
            position: 'sticky',
            top: 0,
            background: 'var(--bg-app)',
            zIndex: 10,
            backdropFilter: 'blur(6px)',
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
              Welcome back
            </div>
            <h2 style={{ fontSize: 20 }}>{user ? `${user.first_name} ${user.last_name}` : ''}</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <IconButton
              onClick={toggleTheme}
              title="Toggle theme"
              icon={theme === 'light' ? 'moon' : 'sun'}
            />
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--grad-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 15,
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              {user ? user.first_name[0].toUpperCase() : '?'}
            </div>
            <LogoutButton onClick={handleLogout} />
          </div>
        </header>
        <main className="ut-fade-in" style={{ padding: '28px 32px', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
