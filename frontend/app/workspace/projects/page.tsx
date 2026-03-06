'use client';

import { useState } from 'react';
import ProjectBoard from '../../../components/saas/ProjectBoard';
import UserProfileSettings from '../../../components/saas/UserProfileSettings';
import { fetchUserByID, updateUserByID } from '../../../lib/api';

export default function WorkspaceProjectsPage() {
  const [tenantID] = useState('tenant-a');
  const [memberID, setMemberID] = useState('1');
  const [memberResult, setMemberResult] = useState('No member lookup executed.');

  async function runMemberLookup() {
    const res = await fetchUserByID(memberID, tenantID);
    setMemberResult(res.ok ? JSON.stringify(res.data) : `Error ${res.status}: ${res.error}`);
  }

  async function runProfileUpdate(payload: { email: string; role: string; internal_notes: string }) {
    const result = await updateUserByID(memberID, payload, tenantID);
    if (!result.ok) {
      return `update failed (${result.status}): ${result.error}`;
    }
    return `updated (${result.status})`;
  }

  return (
    <main className="space-y-4">
      <ProjectBoard />
      <section className="grid gap-4 xl:grid-cols-2">
        <article className="surface-card p-4">
          <h2 className="heading-font text-lg">Member Directory</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Load profile cards by member id and tenant context.</p>
          <div className="mt-3 flex gap-2">
            <input className="field" value={memberID} onChange={(event) => setMemberID(event.target.value)} placeholder="Member ID" />
            <button className="btn btn-primary" onClick={() => void runMemberLookup()}>Open Profile</button>
          </div>
          <p className="mt-3 rounded-12 border border-subtle bg-[var(--surface-soft)] p-2 text-xs break-all">{memberResult}</p>
        </article>
        <UserProfileSettings memberID={memberID} onUpdate={runProfileUpdate} />
      </section>
    </main>
  );
}
