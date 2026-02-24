import { coreTokens } from './core';

export const operatorTheme = {
  name: 'operator',
  colors: {
    background: '#0B0D12',
    surface: '#151922',
    accentPrimary: '#00F5A0',
    accentDefense: '#3B82FF',
    accentOffense: '#FF3B3B',
    accentMixed: '#8B5CF6',
    warning: '#FF8A00',
    textPrimary: '#E6EDF7',
    textSecondary: '#9AA4B2',
    footerMuted: '#6B7380',
  },
  gradients: {
    toxic: ['#00F5A0', '#00C2FF'],
    exploit: ['#FF3B3B', '#00F5A0'],
    defense: ['#3B82FF', '#00C2FF'],
  },
  typography: {
    heading: ['Orbitron', 'Inter', 'sans-serif'],
    body: ['Inter', 'sans-serif'],
    code: ['JetBrains Mono', 'monospace'],
  },
  difficulty: {
    beginner: '#3B82FF',
    intermediate: '#00F5A0',
    advanced: '#FF8A00',
    adversary: '#FF3B3B',
  },
  core: coreTokens,
} as const;

export type OperatorTheme = typeof operatorTheme;
