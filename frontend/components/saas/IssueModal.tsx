'use client';

import { useEffect, useState } from 'react';

export default function IssueModal() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('No draft saved.');

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener('vaporlab:open-issue-modal', onOpen);
    return () => window.removeEventListener('vaporlab:open-issue-modal', onOpen);
  }, []);

  return (
    <>
      <button className="btn btn-secondary" onClick={() => setOpen(true)}>
        Open Issue Modal
      </button>
      {open && (
        <div className="overlay-scrim fixed inset-0 z-modal flex items-center justify-center p-4">
          <div className="surface-card w-full max-w-xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="heading-font text-lg">Issue Details</h3>
              <button className="btn btn-ghost" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <div className="mt-3 space-y-2">
              <input className="field" defaultValue="NX-241: Validate tenant-level filter behavior" />
              <textarea className="field min-h-28" defaultValue="Track access and assignment behavior for cross-tenant records." />
              <button className="btn btn-primary" onClick={() => setStatus(`Issue draft saved at ${new Date().toLocaleTimeString()}`)}>
                Save Changes
              </button>
              <p className="text-xs text-[var(--text-secondary)]">{status}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
