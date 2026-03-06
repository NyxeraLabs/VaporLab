'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useState } from 'react';

export const STORAGE_KEY = 'vaporlab_operator_auth';
const DEFAULT_USER = 'operator';
const DEFAULT_PASSWORD = 'vaporlab';
const DEFAULT_MFA_CODE = '000000';

export default function OperatorAccessGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.sessionStorage.getItem(STORAGE_KEY);
    if (saved === 'true') {
      setAuthenticated(true);
    }
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const expectedUser = process.env.NEXT_PUBLIC_OPERATOR_USER ?? DEFAULT_USER;
    const expectedPassword = process.env.NEXT_PUBLIC_OPERATOR_PASSWORD ?? DEFAULT_PASSWORD;
    const expectedCode = process.env.NEXT_PUBLIC_OPERATOR_MFA_CODE ?? DEFAULT_MFA_CODE;
    if (username === expectedUser && password === expectedPassword && code === expectedCode) {
      window.sessionStorage.setItem(STORAGE_KEY, 'true');
      setAuthenticated(true);
      setError('');
      return;
    }
    setError('Invalid credentials or MFA code');
  }

  if (authenticated) return <>{children}</>;

  return (
    <main className="app-shell theme-operator flex items-center justify-center p-6">
      <section className="surface-card w-full max-w-md p-6">
        <div className="mb-4 flex items-center justify-center">
          <Image
            src="/VaporLab_Logo.png"
            alt="VaporLab"
            width={520}
            height={520}
            priority
            className="h-56 w-auto"
          />
        </div>
        <h1 className="heading-font text-2xl">Operator Access</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Enter operator credentials to access control routes.
        </p>
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="field"
            placeholder="Username"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field"
            placeholder="Password"
          />
          <input
            type="text"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="field"
            placeholder="MFA code"
          />
          <button type="submit" className="btn btn-primary w-full">
            Unlock
          </button>
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
        </form>
      </section>
    </main>
  );
}
