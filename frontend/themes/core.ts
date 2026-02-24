export const coreTokens = {
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
  },
  radius: {
    r8: '8px',
    r12: '12px',
    r16: '16px',
    r20: '20px',
  },
  shadow: {
    soft: '0 6px 18px rgba(8, 13, 22, 0.12)',
    elevated: '0 18px 36px rgba(8, 13, 22, 0.22)',
    subtleGlow: '0 0 0 1px currentColor',
  },
  typography: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
  },
  transition: {
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
  },
  layout: {
    content: '72rem',
    wide: '90rem',
  },
  zIndex: {
    base: 1,
    nav: 40,
    overlay: 60,
    modal: 80,
    badge: 100,
  },
} as const;

export type CoreTokens = typeof coreTokens;
