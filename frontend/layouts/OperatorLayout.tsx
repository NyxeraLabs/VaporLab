'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Footer from '../components/common/Footer';
import ModeBadge, { type OperatorMode } from '../components/operator/ModeBadge';
import OperatorAccessGate, { STORAGE_KEY } from '../components/operator/OperatorAccessGate';
import { fetchAuthConfig, fetchHealth } from '../lib/api';

type OperatorLayoutProps = {
  children: React.ReactNode;
  mode?: OperatorMode;
};

export default function OperatorLayout({ children, mode = 'VULNERABLE' }: OperatorLayoutProps) {
  const [liveMode, setLiveMode] = useState<OperatorMode>(mode);

  useEffect(() => {
    async function refreshMode() {
      const [healthRes, authCfgRes] = await Promise.all([fetchHealth(), fetchAuthConfig()]);
      const effective = healthRes.effective_secure_mode ?? healthRes.secure_mode;
      if (effective) {
        setLiveMode('HARDENED');
        return;
      }
      if (authCfgRes.ok && authCfgRes.data?.weak_secret) {
        setLiveMode('VULNERABLE');
        return;
      }
      setLiveMode('MIXED');
    }
    void refreshMode();
  }, []);

  function logout() {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  return (
    <div className="theme-operator app-shell">
      <OperatorAccessGate>
        <ModeBadge mode={liveMode} />
        <div className="mx-auto flex min-h-screen max-w-wide flex-col px-4 py-5 sm:px-6">
          <header className="surface-card sticky top-3 z-nav mb-4 flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Image src="/VaporLab_Logo.png" alt="VaporLab" width={140} height={140} className="h-24 w-auto" priority />
              <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">VaporLab Operator</p>
              <h1 className="heading-font text-xl">Control Panel</h1>
              </div>
            </div>
            <nav className="flex gap-2 text-sm">
              <a className="btn btn-ghost" href="/operator">
                Dashboard
              </a>
              <a className="btn btn-ghost" href="/workspace/home">
                Target SaaS
              </a>
              <button className="btn btn-ghost" onClick={logout}>
                Logout
              </button>
            </nav>
          </header>
          <div className="flex-1">{children}</div>
          <Footer variant="operator" />
        </div>
      </OperatorAccessGate>
    </div>
  );
}
