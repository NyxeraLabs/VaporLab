'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Footer from '../../components/common/Footer';
import IssueModal from '../../components/saas/IssueModal';
import Sidebar from '../../components/saas/Sidebar';

const titleMap: Record<string, string> = {
  '/workspace/home': 'Team Home',
  '/workspace/projects': 'Projects',
  '/workspace/backlog': 'Backlog',
  '/workspace/roadmap': 'Roadmap',
  '/workspace/reports': 'Reports',
  '/workspace/settings': 'Settings',
};

export default function WorkspaceRouteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = useMemo(() => titleMap[pathname] ?? 'Workspace', [pathname]);

  return (
    <div className="theme-saas app-shell">
      <div className="mx-auto flex min-h-screen max-w-wide flex-col px-4 py-5 sm:px-6">
        <main className="grid flex-1 gap-4 lg:grid-cols-[240px_1fr]">
          <Sidebar />
          <section className="space-y-4">
            <header className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">Workspace Portal</p>
                <h1 className="heading-font text-2xl">Project Atlas {pageTitle}</h1>
              </div>
              <IssueModal />
            </header>
            {children}
          </section>
        </main>
        <Footer variant="saas" />
      </div>
    </div>
  );
}
