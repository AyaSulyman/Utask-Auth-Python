'use client';

import type {
  ButtonHTMLAttributes,
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react';
import { Icon, type IconName } from './icons';

export interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  style?: CSSProperties;
}

export function Card({ children, className = '', hover = false, style }: CardProps) {
  return (
    <div
      className={`ut-card ${hover ? 'ut-card--hover' : ''} ${className}`}
      style={{
        background: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-card)',
        padding: '22px',
        border: '1px solid var(--border-subtle)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export interface GradientButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  style?: CSSProperties;
  full?: boolean;
}

export function GradientButton({
  children,
  onClick,
  type = 'button',
  disabled,
  loading,
  icon,
  style,
  full,
}: GradientButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className="ut-btn ut-btn-gradient"
      style={{
        background: 'var(--grad-primary)',
        color: '#fff',
        borderRadius: 'var(--radius-pill)',
        padding: '13px 26px',
        fontWeight: 700,
        fontSize: 14.5,
        width: full ? '100%' : 'auto',
        opacity: disabled ? 0.6 : 1,
        boxShadow: 'var(--shadow-glow)',
        ...style,
      }}
    >
      {loading ? (
        <span className="ut-spin" style={{ display: 'flex' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </span>
      ) : (
        icon && <Icon name={icon} size={16} />
      )}
      {children}
    </button>
  );
}

export interface GhostButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: IconName;
  disabled?: boolean;
  style?: CSSProperties;
  danger?: boolean;
}

export function GhostButton({
  children,
  onClick,
  type = 'button',
  icon,
  disabled,
  style,
  danger,
}: GhostButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="ut-btn ut-btn-ghost"
      style={{
        background: danger ? 'rgba(240, 67, 156, 0.1)' : 'var(--bg-pill)',
        color: danger ? 'var(--danger)' : 'var(--text-primary)',
        borderRadius: 'var(--radius-pill)',
        padding: '10px 20px',
        fontWeight: 600,
        fontSize: 13.5,
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={14.5} />}
      {children}
    </button>
  );
}

export interface IconButtonProps {
  onClick?: () => void;
  icon: IconName;
  title?: string;
  size?: number;
  iconSize?: number;
  style?: CSSProperties;
}

export function IconButton({ onClick, icon, title, size = 38, iconSize = 16, style }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className="ut-icon-btn"
      style={{ width: size, height: size, ...style }}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  );
}

export interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, error, hint, children }: FieldProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: 7,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-secondary)',
          }}
        >
          {label}
        </label>
      )}
      {children}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            color: 'var(--danger)',
            fontSize: 12.5,
            marginTop: 6,
            fontWeight: 600,
          }}
        >
          <Icon name="alert" size={13} />
          {error}
        </div>
      )}
      {!error && hint && (
        <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 6 }}>{hint}</div>
      )}
    </div>
  );
}

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: IconName;
}

export function TextInput({ icon, style, ...rest }: TextInputProps) {
  const input = (
    <input
      {...rest}
      className="ut-input"
      style={{
        width: '100%',
        padding: icon ? '12px 15px 12px 42px' : '12px 15px',
        borderRadius: 'var(--radius-sm)',
        border: '1.5px solid var(--border-subtle)',
        background: 'var(--bg-surface-alt)',
        color: 'var(--text-primary)',
        fontSize: 14.5,
        outline: 'none',
        ...style,
      }}
    />
  );
  if (!icon) return input;
  return (
    <div style={{ position: 'relative' }}>
      <span
        style={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          display: 'flex',
        }}
      >
        <Icon name={icon} size={16} />
      </span>
      {input}
    </div>
  );
}

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ style, children, ...rest }: SelectProps) {
  return (
    <select
      {...rest}
      className="ut-input"
      style={{
        width: '100%',
        padding: '12px 15px',
        borderRadius: 'var(--radius-sm)',
        border: '1.5px solid var(--border-subtle)',
        background: 'var(--bg-surface-alt)',
        color: 'var(--text-primary)',
        fontSize: 14.5,
        outline: 'none',
        ...style,
      }}
    >
      {children}
    </select>
  );
}

export type BadgeTone = 'admin' | 'client' | 'success' | 'default';

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: IconName;
}

export function Badge({ children, tone = 'default', icon }: BadgeProps) {
  const tones: Record<BadgeTone, { bg: string; color: string }> = {
    admin: { bg: 'rgba(124,58,237,0.12)', color: 'var(--violet)' },
    client: { bg: 'rgba(240,67,156,0.12)', color: 'var(--magenta)' },
    success: { bg: 'rgba(33,192,139,0.12)', color: 'var(--success)' },
    default: { bg: 'var(--bg-pill)', color: 'var(--text-secondary)' },
  };
  const t = tones[tone] || tones.default;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: t.bg,
        color: t.color,
        padding: '5px 12px',
        borderRadius: 'var(--radius-pill)',
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'capitalize',
      }}
    >
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

export type BannerTone = 'error' | 'success';

export interface BannerProps {
  children: ReactNode;
  tone?: BannerTone;
}

export function Banner({ children, tone = 'error' }: BannerProps) {
  const tones: Record<BannerTone, { bg: string; color: string; icon: IconName }> = {
    error: { bg: 'rgba(240,67,156,0.1)', color: 'var(--danger)', icon: 'alert' },
    success: { bg: 'rgba(33,192,139,0.12)', color: 'var(--success)', icon: 'check' },
  };
  const t = tones[tone];
  return (
    <div
      className="ut-fade-in"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 9,
        background: t.bg,
        color: t.color,
        borderRadius: 'var(--radius-sm)',
        padding: '12px 15px',
        fontSize: 13.5,
        fontWeight: 600,
        marginBottom: 16,
      }}
    >
      <Icon name={t.icon} size={16} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{children}</span>
    </div>
  );
}

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  sub?: string;
}

export function EmptyState({ icon = 'inbox', title, sub }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '44px 20px',
        color: 'var(--text-muted)',
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'var(--bg-pill)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
          color: 'var(--text-secondary)',
        }}
      >
        <Icon name={icon} size={22} />
      </div>
      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14.5 }}>{title}</div>
      {sub && <div style={{ fontSize: 13, marginTop: 4, maxWidth: 320 }}>{sub}</div>}
    </div>
  );
}

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      className="ut-spin"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ color: 'var(--magenta)' }}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity={0.2} />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function Skeleton({
  width = '100%',
  height = 16,
  style,
}: {
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
}) {
  return <div className="ut-skeleton" style={{ width, height, ...style }} />;
}

export { Icon };
export type { ButtonHTMLAttributes, IconName };
