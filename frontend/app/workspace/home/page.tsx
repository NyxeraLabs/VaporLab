'use client';

import { useEffect, useState } from 'react';
import { fetchHealth, fetchUsers, runAIQuery } from '../../../lib/api';
import { readWorkspaceSession } from '../../../lib/workspaceSession';

export default function WorkspaceHomePage() {
  const [runtime, setRuntime] = useState('Loading workspace runtime...');
  const [members, setMembers] = useState('0');
  const [brief, setBrief] = useState('No daily brief generated.');
  const [tenant, setTenant] = useState('tenant-a');

  useEffect(() => {
    async function bootstrap() {
      try {
        const session = readWorkspaceSession();
        const tenantId = session?.tenant ?? 'tenant-a';
        setTenant(tenantId);
        const [health, users] = await Promise.all([fetchHealth(), fetchUsers(tenantId)]);
        const mode = (health.effective_secure_mode ?? health.secure_mode) ? 'Protected' : 'Standard';
        setRuntime(`${mode} runtime online`);
        setMembers(String(users.length));
      } catch {
        setRuntime('Runtime unavailable');
      }
    }
    void bootstrap();
  }, []);

  async function generateBrief() {
    const res = await runAIQuery('Generate a concise project standup brief for product and security teams.');
    if (!res.ok) {
      setBrief(`brief failed (${res.status}): ${res.error}`);
      return;
    }
    setBrief(String(res.data?.answer ?? 'No brief generated'));
  }

  return (
    <main className="space-y-4">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="surface-card p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">Workspace Status</p>
          <p className="heading-font mt-2 text-xl">{runtime}</p>
        </article>
        <article className="surface-card p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">Active Members</p>
          <p className="heading-font mt-2 text-xl">{members}</p>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">Tenant: {tenant}</p>
        </article>
        <article className="surface-card p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">Automation</p>
          <button className="btn btn-primary mt-2" onClick={() => void generateBrief}>Generate Daily Brief</button>
        </article>
      </section>

      <section className="surface-card p-4">
        <h2 className="heading-font text-lg">Daily Brief</h2>
        <p className="mt-3 rounded-12 border border-subtle bg-[var(--surface-soft)] p-3 text-sm">{brief}</p>
      </section>
    </main>
  );
}
