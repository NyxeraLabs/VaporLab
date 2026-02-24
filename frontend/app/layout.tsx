import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VaporLab',
  description: 'Nyxera Labs offensive API security training platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
