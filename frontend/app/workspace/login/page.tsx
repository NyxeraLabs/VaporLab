'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authenticateWorkspaceUser, workspaceAccounts, writeWorkspaceSession } from '../../../lib/workspaceSession';

export default function WorkspaceLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('userA');
  const [password, setPassword] = useState('vaporlab');
  const [error, setError] = useState('');
  const accounts = useMemo(() => workspaceAccounts(), []);

  function login() {
    const user = authenticateWorkspaceUser(username, password);
    if (!user) {
      setError('Invalid workspace credentials');
      return;
    }
    writeWorkspaceSession(user);
    router.push('/workspace/home');
  }

  return (
    <main className="mx-auto w-full max-w-xl">
      <section className="surface-card p-6">
        <h2 className="heading-font text-2xl">Workspace Login</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Sign in with lab tenant accounts to test cross-tenant flows.
        </p>

        <div className="mt-4 space-y-3">
          <label className="text-xs text-[var(--text-secondary)]">User</label>
          <select className="field" value={username} onChange={(event) => setUsername(event.target.value)}>
            {accounts.map((account) => (
              <option key={account.username} value={account.username}>
                {account.username} ({account.tenant})
              </option>
            ))}
          </select>
          <label className="text-xs text-[var(--text-secondary)]">Password</label>
          <input
            className="field"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
          />
          <button className="btn btn-primary w-full" onClick={login}>Sign In</button>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <p className="text-xs text-[var(--text-secondary)]">
            Need an account? <Link href="/workspace/register" className="underline">Register workspace user</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
