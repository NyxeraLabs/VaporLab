import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'VaporLab Control Deck',
  description: 'Professional frontend console for VaporLab offensive API lab',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="grid-overlay">{children}</body>
    </html>
  );
}
