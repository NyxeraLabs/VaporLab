'use client';

import { useEffect, useState } from 'react';
import DifficultySelector from '../../components/operator/DifficultySelector';
import ExploitChainCanvas from '../../components/operator/ExploitChainCanvas';
import VulnerabilityCard from '../../components/operator/VulnerabilityCard';
import {
  fetchAuthConfig,
  fetchHealth,
  fetchTenantManagement,
  probeChain,
  setAuthMode,
} from '../../lib/api';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Adversary';
type ModuleState = {
  title: string;
  description: string;
  category: 'Access Control' | 'Injection' | 'Identity' | 'AI/ML' | 'Configuration';
  active: boolean;
};

const baseModules: ModuleState[] = [
  {
    title: 'Broken Object Level Authorization',
    description: 'Cross-tenant object access checks can be relaxed for training sequences.',
    category: 'Access Control' as const,
    active: true,
  },
  {
    title: 'Command Injection Surface',
    description: 'Export format execution path can be hardened or left intentionally weak.',
    category: 'Injection' as const,
    active: true,
  },
  {
    title: 'OAuth Misconfiguration',
    description: 'Redirect and signature controls can be toggled to shape identity abuse.',
    category: 'Identity' as const,
    active: false,
  },
  {
    title: 'Prompt Chaining Exposure',
    description: 'AI controls can permit prompt exfiltration and poisoning scenarios.',
    category: 'AI/ML' as const,
    active: false,
  },
  {
    title: 'Inventory Drift',
    description: 'Legacy and hidden endpoints can be surfaced or blocked by policy profile.',
    category: 'Configuration' as const,
    active: true,
  },
];

export default function OperatorPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [modules, setModules] = useState<ModuleState[]>(baseModules);
  const [runtime, setRuntime] = useState('loading runtime...');
  const [chainSignal, setChainSignal] = useState('chain not loaded');
  const [resultLog, setResultLog] = useState('No actions executed.');

  function updateModule(title: string, active: boolean) {
    setModules((prev) => prev.map((item) => (item.title === title ? { ...item, active } : item)));
  }

  function appendLog(message: string) {
    setResultLog((prev) => `${message}\n${prev}`.slice(0, 1400));
  }

  async function refreshRuntime() {
    const [healthRes, authCfgRes, tenantRes, chainRes] = await Promise.all([
      fetchHealth(),
      fetchAuthConfig(),
      fetchTenantManagement(),
      probeChain(),
    ]);
    const secure = healthRes.secure_mode ? 'HARDENED' : 'VULNERABLE';
    const weak = authCfgRes.ok && authCfgRes.data?.weak_secret ? 'weak-jwt-secret' : 'strong-jwt-secret';
    const tenantState = tenantRes.ok && tenantRes.data?.unsafe ? 'unsafe-tenant-admin' : 'tenant-controls-on';
    setRuntime(`${secure} | ${weak} | ${tenantState}`);
    setChainSignal(chainRes.data?.chain ?? `chain unavailable (${chainRes.status})`);
  }

  async function applyMode(secureMode: boolean) {
    const response = await setAuthMode(secureMode);
    if (response.ok) {
      appendLog(`auth/mode -> secure_mode=${String(response.data?.secure_mode)}`);
      await refreshRuntime();
      return;
    }
    appendLog(`auth/mode failed -> ${response.status} ${response.error}`);
  }

  useEffect(() => {
    void refreshRuntime();
  }, []);

  return (
    <main className="space-y-4">
      <section className="surface-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">Lab Runtime</p>
            <h2 className="heading-font text-2xl">Scenario Control Matrix</h2>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={() => void applyMode(true)}>Harden API</button>
            <button className="btn btn-danger" onClick={() => void applyMode(false)}>Expose Lab Surface</button>
            <button className="btn btn-ghost" onClick={() => void refreshRuntime()}>Refresh Runtime</button>
          </div>
        </div>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">Runtime: {runtime}</p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">Chain: {chainSignal}</p>
      </section>

      <DifficultySelector value={difficulty} onChange={setDifficulty} />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <div key={module.title} className="space-y-2">
            <VulnerabilityCard
              title={module.title}
              description={module.description}
              category={module.category}
              active={module.active}
            />
            <div className="flex gap-2">
              <button className="btn btn-ghost text-xs" onClick={() => updateModule(module.title, true)}>Module On</button>
              <button className="btn btn-ghost text-xs" onClick={() => updateModule(module.title, false)}>Module Off</button>
            </div>
          </div>
        ))}
      </section>

      <ExploitChainCanvas />
      <section className="surface-card p-4">
        <h3 className="heading-font text-lg">Operator Event Log</h3>
        <pre className="code-font mt-3 overflow-auto rounded-12 border border-subtle bg-[var(--surface-soft)] p-3 text-xs">
          {resultLog}
        </pre>
      </section>
    </main>
  );
}
