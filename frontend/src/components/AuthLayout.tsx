'use client';

import type { ReactNode } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { IconButton } from './ui';

export interface AuthLayoutProps {
  children: ReactNode;
  headline: string;
  sub: string;
}

export default function AuthLayout({ children, headline, sub }: AuthLayoutProps) {
  const { theme, toggleTheme } = useTheme();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-app)' }}>
      <div
        className="ut-mesh"
        style={{
          flex: 1,
          maxWidth: 460,
          background: 'var(--grad-primary)',
          color: '#fff',
          padding: '48px 44px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
            right: -110,
            bottom: -110,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 160,
            height: 160,
            borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,0.14)',
            right: 30,
            top: 90,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
            }}
          >
            u
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19 }}>
            uTask
          </span>
        </div>

        <div style={{ position: 'relative' }}>
          <h1 style={{ fontSize: 34, lineHeight: 1.2, marginBottom: 14 }}>{headline}</h1>
          <p style={{ fontSize: 15, opacity: 0.92, lineHeight: 1.6, marginBottom: 28 }}>{sub}</p>
        </div>

        <div style={{ fontSize: 12.5, opacity: 0.75, position: 'relative' }}>
          © {new Date().getFullYear()} uTask — Full Authentication & User Management System
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: 28, right: 32 }}>
          <IconButton onClick={toggleTheme} title="Toggle theme" icon={theme === 'light' ? 'moon' : 'sun'} />
        </div>
        <div className="ut-scale-in" style={{ width: '100%', maxWidth: 400 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
