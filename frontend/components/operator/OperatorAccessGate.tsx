'use client';

import { FormEvent, useEffect, useState } from 'react';

const STORAGE_KEY = 'vaporlab_operator_auth';
const DEFAULT_KEY = 'vaporlab-ops';

export default function OperatorAccessGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState('');
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
    const expected = process.env.NEXT_PUBLIC_OPERATOR_ACCESS_KEY ?? DEFAULT_KEY;
    if (input === expected) {
      window.sessionStorage.setItem(STORAGE_KEY, 'true');
      setAuthenticated(true);
      setError('');
      return;
    }
    setError('Invalid operator access key');
  }

  if (authenticated) return <>{children}</>;

  return (
    <main className="app-shell theme-operator flex items-center justify-center p-6">
      <section className="surface-card w-full max-w-md p-6">
        <h1 className="heading-font text-2xl">Operator Access</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Enter the operator key to access control routes.
        </p>
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <input
            type="password"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="field"
            placeholder="Operator key"
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
