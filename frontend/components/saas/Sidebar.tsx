'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems: Array<{ label: string; href: string }> = [
  { label: 'Home', href: '/workspace/home' },
  { label: 'Projects', href: '/workspace/projects' },
  { label: 'Backlog', href: '/workspace/backlog' },
  { label: 'Roadmap', href: '/workspace/roadmap' },
  { label: 'Reports', href: '/workspace/reports' },
  { label: 'Settings', href: '/workspace/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-16 bg-[var(--sidebar)] p-4 text-[var(--surface)]">
      <div className="surface-soft p-3">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">NimbusFlow</p>
        <h2 className="mt-1 heading-font text-xl font-semibold text-[var(--text-primary)]">Workspace</h2>
      </div>
      <nav className="mt-5 space-y-1 text-sm">
        {navItems.map((item, index) => (
          <Link
            key={item.label}
            href={item.href}
            className={`block rounded-12 px-3 py-2 transition duration-normal ${
              pathname === item.href
                ? 'bg-[var(--primary)] text-[var(--surface)] font-semibold'
                : index === 1
                  ? 'text-[var(--surface)] hover:bg-[var(--secondary)]'
                  : 'text-[var(--surface)] hover:bg-[var(--secondary)]'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
