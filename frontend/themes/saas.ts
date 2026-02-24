import { coreTokens } from './core';

export const saasTheme = {
  name: 'saas',
  colors: {
    background: '#F7F9FC',
    sidebar: '#1F2937',
    primary: '#2563EB',
    secondary: '#7C3AED',
    danger: '#DC2626',
    success: '#16A34A',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    footerMuted: '#6B7280',
    surface: '#FFFFFF',
  },
  typography: {
    heading: ['Inter', 'sans-serif'],
    body: ['Inter', 'sans-serif'],
  },
  core: coreTokens,
} as const;

export type SaaSTheme = typeof saasTheme;
