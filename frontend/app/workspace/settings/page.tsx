'use client';

import { useEffect, useState } from 'react';
import OAuthConnectionSettings from '../../../components/saas/OAuthConnectionSettings';
import UserProfileSettings from '../../../components/saas/UserProfileSettings';
import WorkspaceSwitcher from '../../../components/saas/WorkspaceSwitcher';
import { fetchOIDCAuthorizeProbeWithNonce, fetchOIDCToken, fetchOIDCUserInfo, updateUserByID } from '../../../lib/api';
import { readWorkspaceSession } from '../../../lib/workspaceSession';

export default function WorkspaceSettingsPage() {
  const [tenantID, setTenantID] = useState('tenant-a');

  useEffect(() => {
    const session = readWorkspaceSession();
    if (session?.tenant) {
      setTenantID(session.tenant);
    }
  }, []);
  const [memberID] = useState('1');
  const [oidcClient, setOidcClient] = useState('lab');
  const [oidcRedirect, setOidcRedirect] = useState('https://app.vaporlab.local/callback');
  const [oidcStatus, setOidcStatus] = useState('No OAuth validation run.');

  async function validateOIDCConnection() {
    const nonce = `settings-${Date.now()}`;
    const authorizeRes = await fetchOIDCAuthorizeProbeWithNonce(oidcClient, oidcRedirect, 'settings-demo', nonce);
    const match = authorizeRes.location.match(/[?&]code=([^&]+)/);
    const authCode = match?.[1] ? decodeURIComponent(match[1]) : '';
    const tokenRes = authCode
      ? await fetchOIDCToken({
        grant_type: 'authorization_code',
        client_id: oidcClient,
        client_secret: 'lab-secret',
        redirect_uri: oidcRedirect,
        code: authCode,
      })
      : await fetchOIDCToken();
    const userInfoRes = await fetchOIDCUserInfo(tokenRes.data?.access_token);
    const message = `authorize=${authorizeRes.status} token=${tokenRes.status} userinfo=${userInfoRes.status}`;
    setOidcStatus(message);
    return message;
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
      <section className="grid gap-4 xl:grid-cols-2">
        <WorkspaceSwitcher tenant={tenantID} onTenantChange={setTenantID} />
        <article className="surface-card p-4">
          <h2 className="heading-font text-lg">Identity Validation Status</h2>
          <p className="mt-3 rounded-12 border border-subtle bg-[var(--surface-soft)] p-2 text-xs">{oidcStatus}</p>
        </article>
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        <OAuthConnectionSettings
          clientID={oidcClient}
          redirectURI={oidcRedirect}
          onClientChange={setOidcClient}
          onRedirectChange={setOidcRedirect}
          onValidate={validateOIDCConnection}
        />
        <UserProfileSettings memberID={memberID} onUpdate={runProfileUpdate} />
      </section>
    </main>
  );
}
