import type { CSSProperties, SVGProps } from 'react';

const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export type IconName =
  | 'dashboard' | 'users' | 'user' | 'stats' | 'sun' | 'moon' | 'logout' | 'plus'
  | 'edit' | 'trash' | 'search' | 'chevron-left' | 'chevron-right' | 'x' | 'shield'
  | 'mail' | 'phone' | 'map-pin' | 'cake' | 'arrow-up-right' | 'check' | 'alert'
  | 'lock' | 'inbox';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}

export function Icon({ name, size = 18, style, ...rest }: IconProps) {
  const props = { ...base, width: size, height: size, style, ...rest };
  switch (name) {

    case 'dashboard':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="9" rx="2" />
          <rect x="14" y="3" width="7" height="5" rx="2" />
          <rect x="14" y="12" width="7" height="9" rx="2" />
          <rect x="3" y="16" width="7" height="5" rx="2" />
        </svg>
      );
    case 'users':
      return (
        <svg {...props}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="10" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'user':
      return (
        <svg {...props}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    case 'stats':
      return (
        <svg {...props}>
          <path d="M3 20V10" />
          <path d="M10 20V4" />
          <path d="M17 20v-7" />
        </svg>
      );
    case 'sun':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.4M12 19.1v2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7" />
        </svg>
      );
    case 'moon':
      return (
        <svg {...props}>
          <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...props}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...props}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'edit':
      return (
        <svg {...props}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      );
    case 'trash':
      return (
        <svg {...props}>
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      );
    case 'search':
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="7.5" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      );
    case 'chevron-left':
      return (
        <svg {...props}>
          <path d="M15 18l-6-6 6-6" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg {...props}>
          <path d="M9 18l6-6-6-6" />
        </svg>
      );
    case 'x':
      return (
        <svg {...props}>
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...props}>
          <path d="M12 2.5l8 3.4v6c0 5.2-3.4 8.4-8 9.6-4.6-1.2-8-4.4-8-9.6v-6Z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'mail':
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
    case 'phone':
      return (
        <svg {...props}>
          <path d="M15.05 5.5a5.5 5.5 0 0 1 4.45 4.5M14.05 2.5a9 9 0 0 1 7.45 7.5" />
          <path d="M4.7 3.5h3l1.5 4-2 1.5a12.5 12.5 0 0 0 5.8 5.8l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A18 18 0 0 1 2.7 5.7a2 2 0 0 1 2-2.2Z" />
        </svg>
      );
    case 'map-pin':
      return (
        <svg {...props}>
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.6" />
        </svg>
      );
    case 'cake':
      return (
        <svg {...props}>
          <path d="M4 21v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6" />
          <path d="M2 21h20" />
          <path d="M12 13V9" />
          <path d="M12 9c-1 0-1.6-.8-1.6-1.6C10.4 6.4 12 4 12 4s1.6 2.4 1.6 3.4C13.6 8.2 13 9 12 9Z" />
          <path d="M6 13V9M18 13V9" />
        </svg>
      );
    case 'arrow-up-right':
      return (
        <svg {...props}>
          <path d="M7 17L17 7" />
          <path d="M8 7h9v9" />
        </svg>
      );
    case 'check':
      return (
        <svg {...props}>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    case 'alert':
      return (
        <svg {...props}>
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.3 3.9 2.5 18a1.8 1.8 0 0 0 1.6 2.6h15.8a1.8 1.8 0 0 0 1.6-2.6L13.7 3.9a1.8 1.8 0 0 0-3.4 0Z" />
        </svg>
      );
    case 'lock':
      return (
        <svg {...props}>
          <rect x="4" y="10.5" width="16" height="10" rx="2.2" />
          <path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5" />
          <path d="M12 14.5v3" />
        </svg>
      );
    case 'inbox':
      return (
        <svg {...props}>
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.4 5.4A2 2 0 0 1 7.2 4h9.6a2 2 0 0 1 1.8 1.4L21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6Z" />
        </svg>
      );
        default:
      return null;
  }
}
