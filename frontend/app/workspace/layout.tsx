'use client';

import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Footer from '../../components/common/Footer';
import IssueModal from '../../components/saas/IssueModal';
import Sidebar from '../../components/saas/Sidebar';
import { clearWorkspaceSession, readWorkspaceSession } from '../../lib/workspaceSession';

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
  const router = useRouter();
  const pageTitle = useMemo(() => titleMap[pathname] ?? 'Workspace', [pathname]);
  const [scheme, setScheme] = useState<'light' | 'dark'>('light');
  const [authReady, setAuthReady] = useState(false);
  const [username, setUsername] = useState('');
  const [tenant, setTenant] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('vaporlab_workspace_scheme');
    if (saved === 'dark' || saved === 'light') {
      setScheme(saved);
    }
  }, []);

  useEffect(() => {
    if (pathname === '/workspace/login' || pathname === '/workspace/register') {
      setAuthReady(true);
      return;
    }
    const session = readWorkspaceSession();
    if (!session) {
      router.push('/workspace/login');
      return;
    }
    setUsername(session.username);
    setTenant(session.tenant);
    setAuthReady(true);
  }, [pathname, router]);

  function toggleScheme() {
    setScheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('vaporlab_workspace_scheme', next);
      }
      return next;
    });
  }

  function logout() {
    clearWorkspaceSession();
    router.push('/workspace/login');
  }

  if (!authReady) {
    return (
      <div className="theme-saas app-shell" data-scheme={scheme}>
        <div className="mx-auto flex min-h-screen max-w-wide items-center justify-center px-4 py-5 sm:px-6">
          <div className="surface-card p-5 text-sm text-[var(--text-secondary)]">Loading workspace session...</div>
        </div>
      </div>
    );
  }

  if (pathname === '/workspace/login' || pathname === '/workspace/register') {
    return (
      <div className="theme-saas app-shell" data-scheme={scheme}>
        <div className="mx-auto flex min-h-screen max-w-wide flex-col px-4 py-5 sm:px-6">
          <div className="flex-1 flex items-center justify-center">{children}</div>
          <Footer variant="saas" />
        </div>
      </div>
    );
  }

  return (
    <div className="theme-saas app-shell" data-scheme={scheme}>
      <div className="mx-auto flex min-h-screen max-w-wide flex-col px-4 py-5 sm:px-6">
        <main className="grid flex-1 gap-4 lg:grid-cols-[240px_1fr]">
          <Sidebar />
          <section className="space-y-4">
            <header className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">Workspace Portal</p>
                <h1 className="heading-font text-2xl">Project Atlas {pageTitle}</h1>
                <p className="text-xs text-[var(--text-secondary)]">{username} · {tenant}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn btn-ghost text-xs" onClick={toggleScheme}>
                  {scheme === 'light' ? 'Dark Theme' : 'Light Theme'}
                </button>
                <button className="btn btn-ghost text-xs" onClick={logout}>
                  Logout
                </button>
                <IssueModal />
              </div>
            </header>
            {children}
          </section>
        </main>
        <Footer variant="saas" />
      </div>
    </div>
  );
}
