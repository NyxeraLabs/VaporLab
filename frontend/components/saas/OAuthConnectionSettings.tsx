'use client';

import { useState } from 'react';

type OAuthConnectionSettingsProps = {
  clientID: string;
  redirectURI: string;
  onClientChange: (value: string) => void;
  onRedirectChange: (value: string) => void;
  onValidate: () => Promise<string>;
};

export default function OAuthConnectionSettings({
  clientID,
  redirectURI,
  onClientChange,
  onRedirectChange,
  onValidate,
}: OAuthConnectionSettingsProps) {
  const [scope, setScope] = useState('openid profile email');
  const [status, setStatus] = useState('No validation executed.');
  const [running, setRunning] = useState(false);

  async function validateConnection() {
    setRunning(true);
    try {
      const res = await onValidate();
      setStatus(`${res} scope=${scope}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <section id="workspace-settings" className="surface-card p-4">
      <h2 className="heading-font text-lg">OAuth Connection Settings</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Validates authorize/token/userinfo against the lab OIDC server.
      </p>
      <div className="mt-3 grid gap-2">
        <input className="field" value={redirectURI} onChange={(event) => onRedirectChange(event.target.value)} />
        <input className="field" value={clientID} onChange={(event) => onClientChange(event.target.value)} />
        <input className="field" value={scope} onChange={(event) => setScope(event.target.value)} />
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => void validateConnection()} disabled={running}>
            {running ? 'Validating...' : 'Validate Connection'}
          </button>
        </div>
      </div>
      <p className="mt-3 rounded-12 border border-subtle bg-[var(--surface-soft)] p-2 text-xs">{status}</p>
    </section>
  );
}
