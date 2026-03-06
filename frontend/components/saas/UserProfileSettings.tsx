'use client';

import { useState } from 'react';

type UserProfileSettingsProps = {
  memberID: string;
  onUpdate: (payload: { email: string; role: string; internal_notes: string }) => Promise<string>;
};

export default function UserProfileSettings({ memberID, onUpdate }: UserProfileSettingsProps) {
  const [email, setEmail] = useState('alex@workspace.local');
  const [role, setRole] = useState('user');
  const [internalNotes, setInternalNotes] = useState('weekly-summary');
  const [status, setStatus] = useState('No profile changes submitted.');
  const [saving, setSaving] = useState(false);

  async function updateProfile() {
    setSaving(true);
    try {
      const message = await onUpdate({ email, role, internal_notes: internalNotes });
      setStatus(`member=${memberID} ${message}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="surface-card p-4">
      <h2 className="heading-font text-lg">User Profile Settings</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        Updates user profile through `/users/:id` patch flow.
      </p>
      <div className="mt-3 grid gap-2">
        <input className="field" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input className="field" value={role} onChange={(event) => setRole(event.target.value)} />
        <input className="field" value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} />
        <button className="btn btn-primary w-fit" onClick={() => void updateProfile()} disabled={saving}>
          {saving ? 'Updating...' : 'Update Profile'}
        </button>
      </div>
      <p className="mt-3 rounded-12 border border-subtle bg-[var(--surface-soft)] p-2 text-xs">{status}</p>
    </section>
  );
}
