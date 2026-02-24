'use client';

import { useEffect, useState } from 'react';
import Footer from '../components/common/Footer';
import ModeBadge, { type OperatorMode } from '../components/operator/ModeBadge';
import OperatorAccessGate from '../components/operator/OperatorAccessGate';
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
      if (healthRes.secure_mode) {
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

  return (
    <div className="theme-operator app-shell">
      <OperatorAccessGate>
        <ModeBadge mode={liveMode} />
        <div className="mx-auto flex min-h-screen max-w-wide flex-col px-4 py-5 sm:px-6">
          <header className="surface-card sticky top-3 z-nav mb-4 flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">VaporLab Operator</p>
              <h1 className="heading-font text-xl">Control Panel</h1>
            </div>
            <nav className="flex gap-2 text-sm">
              <a className="btn btn-ghost" href="/operator">
                Dashboard
              </a>
              <a className="btn btn-ghost" href="/workspace">
                Target SaaS
              </a>
            </nav>
          </header>
          <div className="flex-1">{children}</div>
          <Footer variant="operator" />
        </div>
      </OperatorAccessGate>
    </div>
  );
}
