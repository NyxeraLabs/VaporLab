import type { Config } from 'tailwindcss';
import { operatorTheme } from './themes/operator';
import { saasTheme } from './themes/saas';
import { coreTokens } from './themes/core';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './layouts/**/*.{js,ts,jsx,tsx}',
    './themes/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        operator: operatorTheme.colors,
        saas: saasTheme.colors,
      },
      fontFamily: {
        operatorHeading: [...operatorTheme.typography.heading],
        operatorBody: [...operatorTheme.typography.body],
        operatorCode: [...operatorTheme.typography.code],
        saasHeading: [...saasTheme.typography.heading],
        saasBody: [...saasTheme.typography.body],
      },
      boxShadow: {
        soft: coreTokens.shadow.soft,
        elevated: coreTokens.shadow.elevated,
      },
      borderRadius: {
        8: coreTokens.radius.r8,
        12: coreTokens.radius.r12,
        16: coreTokens.radius.r16,
        20: coreTokens.radius.r20,
      },
      maxWidth: {
        content: coreTokens.layout.content,
        wide: coreTokens.layout.wide,
      },
      transitionDuration: {
        fast: coreTokens.transition.fast,
        normal: coreTokens.transition.normal,
        slow: coreTokens.transition.slow,
      },
      zIndex: {
        base: `${coreTokens.zIndex.base}`,
        nav: `${coreTokens.zIndex.nav}`,
        overlay: `${coreTokens.zIndex.overlay}`,
        modal: `${coreTokens.zIndex.modal}`,
        badge: `${coreTokens.zIndex.badge}`,
      },
    },
  },
  plugins: [],
};

export default config;
