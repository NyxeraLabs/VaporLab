'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchHealth, fetchUsers, probeChain, runAuthIssue, type HealthResponse } from '../lib/api';

type PanelState = 'idle' | 'loading' | 'success' | 'error';

export default function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [chain, setChain] = useState<string>('not executed');
  const [jwtPreview, setJwtPreview] = useState<string>('not generated');
  const [state, setState] = useState<PanelState>('idle');
  const [errorText, setErrorText] = useState('');

  const secureBadge = useMemo(() => {
    if (!health) return 'Unknown';
    return health.secure_mode ? 'Secure Mode Enabled' : 'Vulnerable Mode Enabled';
  }, [health]);

  async function loadData() {
    setState('loading');
    setErrorText('');
    try {
      const [healthRes, usersRes, chainRes, jwtRes] = await Promise.all([
        fetchHealth(),
        fetchUsers(),
        probeChain(),
        runAuthIssue('42'),
      ]);
      setHealth(healthRes);
      setUsers(usersRes);
      setChain(chainRes.chain ?? 'chain response unavailable');
      setJwtPreview(jwtRes.token?.slice(0, 56) + '...' ?? 'missing token');
      setState('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown frontend error';
      setErrorText(message);
      setState('error');
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <header className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-glow backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-mint">VaporLab Frontend Console</p>
            <h1 className="font-display text-3xl font-bold">Offensive API Operations Deck</h1>
          </div>
          <button
            onClick={() => void loadData()}
            className="rounded-xl bg-ember px-4 py-2 font-semibold text-white transition hover:brightness-110"
          >
            Refresh Signals
          </button>
        </div>
        <p className="mt-3 text-sm text-fog/90">Mode status: {secureBadge}</p>
      </header>

      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-white/15 bg-ink/55 p-5 shadow-glow">
          <h2 className="font-display text-xl">Health & Mode</h2>
          <p className="mt-2 text-sm text-fog/90">{health ? `Status: ${health.status}` : 'Loading health...'}</p>
          <p className="text-sm text-fog/90">{secureBadge}</p>
        </article>

        <article className="rounded-2xl border border-white/15 bg-ink/55 p-5 shadow-glow">
          <h2 className="font-display text-xl">JWT Issuance Probe</h2>
          <p className="mt-2 break-all text-sm text-fog/90">{jwtPreview}</p>
        </article>

        <article className="rounded-2xl border border-white/15 bg-ink/55 p-5 shadow-glow">
          <h2 className="font-display text-xl">Users Surface</h2>
          <p className="mt-2 text-sm text-fog/90">Records loaded: {users.length}</p>
          <div className="mt-3 space-y-2 text-xs">
            {users.slice(0, 3).map((u, idx) => (
              <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-2">
                {JSON.stringify(u)}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-white/15 bg-ink/55 p-5 shadow-glow">
          <h2 className="font-display text-xl">Exploit Chain Probe</h2>
          <p className="mt-2 text-sm text-fog/90">{chain}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-mint">State: {state}</p>
          {state === 'error' && <p className="mt-2 text-sm text-ember">{errorText}</p>}
        </article>
      </section>
    </main>
  );
}
