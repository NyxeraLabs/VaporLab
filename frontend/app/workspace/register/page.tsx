'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerWorkspaceUser } from '../../../lib/workspaceSession';

export default function WorkspaceRegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tenant, setTenant] = useState<'tenant-a' | 'tenant-b'>('tenant-a');
  const [status, setStatus] = useState('Create a workspace account for tenant testing.');

  function register() {
    const result = registerWorkspaceUser(username, password, tenant);
    if (!result.ok) {
      setStatus(result.error ?? 'Registration failed');
      return;
    }
    setStatus('Account created. Redirecting to login...');
    window.setTimeout(() => router.push('/workspace/login'), 700);
  }

  return (
    <main className="mx-auto w-full max-w-xl">
      <section className="surface-card p-6">
        <h2 className="heading-font text-2xl">Workspace Register</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Create a tenant-scoped account for realistic BOLA testing.</p>
        <div className="mt-4 space-y-3">
          <label className="text-xs text-[var(--text-secondary)]">Username</label>
          <input className="field" value={username} onChange={(event) => setUsername(event.target.value)} />
          <label className="text-xs text-[var(--text-secondary)]">Password</label>
          <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <label className="text-xs text-[var(--text-secondary)]">Tenant</label>
          <select className="field" value={tenant} onChange={(event) => setTenant(event.target.value as 'tenant-a' | 'tenant-b')}>
            <option value="tenant-a">tenant-a</option>
            <option value="tenant-b">tenant-b</option>
          </select>
          <button className="btn btn-primary w-full" onClick={register}>Register</button>
          <p className="text-xs text-[var(--text-secondary)]">
            Already have an account? <Link href="/workspace/login" className="underline">Go to login</Link>
          </p>
          <p className="text-sm">{status}</p>
        </div>
      </section>
    </main>
  );
}
