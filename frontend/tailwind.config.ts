import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0d1b2a',
        sea: '#1b4965',
        mint: '#62b6cb',
        fog: '#edf6f9',
        ember: '#e76f51'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'sans-serif']
      },
      boxShadow: {
        glow: '0 18px 45px rgba(13, 27, 42, 0.25)'
      }
    }
  },
  plugins: [],
};

export default config;
