'use client';

import { useState } from 'react';

const workspaces = ['Nyxera Labs', 'Atlas Security', 'Sandbox Tenant'];

export default function WorkspaceSwitcher() {
  const [selected, setSelected] = useState(workspaces[0]);
  return (
    <div className="surface-card p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">Workspace</p>
      <select value={selected} onChange={(event) => setSelected(event.target.value)} className="field mt-2">
        {workspaces.map((workspace) => (
          <option key={workspace} value={workspace}>
            {workspace}
          </option>
        ))}
      </select>
    </div>
  );
}
