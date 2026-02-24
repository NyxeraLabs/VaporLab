'use client';

import { useEffect, useState } from 'react';
import AISuggestionPanel from '../../components/saas/AISuggestionPanel';
import IssueModal from '../../components/saas/IssueModal';
import OAuthConnectionSettings from '../../components/saas/OAuthConnectionSettings';
import ProjectBoard from '../../components/saas/ProjectBoard';
import Sidebar from '../../components/saas/Sidebar';
import UserProfileSettings from '../../components/saas/UserProfileSettings';
import WorkspaceSwitcher from '../../components/saas/WorkspaceSwitcher';
import {
  applyCoupon,
  fetchAPIVersion,
  fetchHealth,
  fetchOIDCAuthorizeProbe,
  fetchOIDCUserInfo,
  fetchOpenAPI,
  fetchAIConfig,
  fetchKBSearch,
  fetchURL,
  fetchUserByID,
  fetchUsers,
  runEmbed,
  runBillingExport,
  runGraphQLProbe,
} from '../../lib/api';

export default function WorkspacePage() {
  const [modeLabel, setModeLabel] = useState('loading');
  const [membersLoaded, setMembersLoaded] = useState('0');
  const [memberID, setMemberID] = useState('2');
  const [memberResult, setMemberResult] = useState('No member lookup executed.');

  const [couponCode, setCouponCode] = useState('SPRINT');
  const [couponAmount, setCouponAmount] = useState('100');
  const [billingFormat, setBillingFormat] = useState('json$(echo report)');
  const [billingResult, setBillingResult] = useState('No billing action executed.');

  const [oidcClient, setOidcClient] = useState('lab-client');
  const [oidcRedirect, setOidcRedirect] = useState('http://evil.local/callback');
  const [oidcResult, setOidcResult] = useState('No OAuth action executed.');

  const [resourceURL, setResourceURL] = useState('http://localhost:18080/internal/status');
  const [graphqlProbe, setGraphqlProbe] = useState('{a{b{c{d{e{f}}}}}}');
  const [resourceResult, setResourceResult] = useState('No resource/inventory action executed.');
  const [kbQuery, setKbQuery] = useState('admin-token');
  const [embedText, setEmbedText] = useState('seed vector note for sprint recap');
  const [aiLabResult, setAiLabResult] = useState('No AI lab action executed.');

  useEffect(() => {
    async function bootstrap() {
      const [health, users] = await Promise.all([fetchHealth(), fetchUsers()]);
      setModeLabel(health.secure_mode ? 'Hardened API Profile' : 'Training API Profile');
      setMembersLoaded(String(users.length));
    }
    void bootstrap();
  }, []);

  async function runMemberLookup() {
    const res = await fetchUserByID(memberID);
    setMemberResult(res.ok ? JSON.stringify(res.data) : `Error ${res.status}: ${res.error}`);
  }

  async function runBillingActions() {
    const amount = Number.parseInt(couponAmount, 10);
    if (Number.isNaN(amount)) {
      setBillingResult('Enter numeric amount');
      return;
    }
    const couponRes = await applyCoupon(couponCode, amount);
    const exportRes = await runBillingExport(billingFormat);
    setBillingResult(`coupon=${couponRes.status} export=${exportRes.status}`);
  }

  async function runOIDCActions() {
    const authorizeRes = await fetchOIDCAuthorizeProbe(oidcClient, oidcRedirect);
    const userInfoRes = await fetchOIDCUserInfo(false);
    setOidcResult(`authorize=${authorizeRes.status} userinfo=${userInfoRes.status}`);
  }

  async function runResourceChecks() {
    const ssrfRes = await fetchURL(resourceURL);
    const graphqlRes = await runGraphQLProbe(graphqlProbe);
    const [v1, v2, beta, internal, openapi] = await Promise.all([
      fetchAPIVersion('v1'),
      fetchAPIVersion('v2'),
      fetchAPIVersion('beta'),
      fetchAPIVersion('internal'),
      fetchOpenAPI(),
    ]);
    setResourceResult(
      `ssrf=${ssrfRes.status} gql=${graphqlRes.status} v1=${v1.status} v2=${v2.status} beta=${beta.status} internal=${internal.status} openapi=${openapi.status}`,
    );
  }

  async function runAILabChecks() {
    const [searchRes, embedRes, configRes] = await Promise.all([
      fetchKBSearch(kbQuery),
      runEmbed(embedText),
      fetchAIConfig(),
    ]);
    const searchCount = searchRes.data?.matches.length ?? 0;
    setAiLabResult(`kb=${searchRes.status}(${searchCount} matches) embed=${embedRes.status} config=${configRes.status}`);
  }

  return (
    <main className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <Sidebar />
      <section className="space-y-4">
        <header className="surface-card flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">Workspace Portal</p>
            <h1 className="heading-font text-2xl">Project Atlas Collaboration</h1>
          </div>
          <IssueModal />
        </header>
        <section className="surface-card p-4">
          <p className="text-sm text-[var(--text-secondary)]">API Runtime: {modeLabel}</p>
          <p className="text-sm text-[var(--text-secondary)]">Members loaded from API: {membersLoaded}</p>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <WorkspaceSwitcher />
          <OAuthConnectionSettings />
        </section>

        <ProjectBoard />

        <section className="grid gap-4 xl:grid-cols-2">
          <UserProfileSettings />
          <AISuggestionPanel />
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <article className="surface-card p-4">
            <h2 className="heading-font text-lg">Team Access Workflow</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Simulates directory/profile actions against users API.</p>
            <div className="mt-3 flex gap-2">
              <input className="field" value={memberID} onChange={(event) => setMemberID(event.target.value)} placeholder="Member ID" />
              <button className="btn btn-primary" onClick={() => void runMemberLookup()}>Open Profile</button>
            </div>
            <p className="mt-3 rounded-12 border border-subtle bg-[var(--surface-soft)] p-2 text-xs break-all">{memberResult}</p>
          </article>

          <article className="surface-card p-4">
            <h2 className="heading-font text-lg">Billing Workspace Actions</h2>
            <div className="mt-3 grid gap-2">
              <input className="field" value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Coupon code" />
              <input className="field" value={couponAmount} onChange={(event) => setCouponAmount(event.target.value)} placeholder="Amount" />
              <input className="field" value={billingFormat} onChange={(event) => setBillingFormat(event.target.value)} placeholder="Export format" />
              <button className="btn btn-primary" onClick={() => void runBillingActions()}>Run Billing Workflow</button>
            </div>
            <p className="mt-3 rounded-12 border border-subtle bg-[var(--surface-soft)] p-2 text-xs break-all">{billingResult}</p>
          </article>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <article className="surface-card p-4">
            <h2 className="heading-font text-lg">OAuth Connection Check</h2>
            <div className="mt-3 grid gap-2">
              <input className="field" value={oidcClient} onChange={(event) => setOidcClient(event.target.value)} placeholder="Client ID" />
              <input className="field" value={oidcRedirect} onChange={(event) => setOidcRedirect(event.target.value)} placeholder="Redirect URI" />
              <button className="btn btn-secondary" onClick={() => void runOIDCActions()}>Validate OAuth Flow</button>
            </div>
            <p className="mt-3 rounded-12 border border-subtle bg-[var(--surface-soft)] p-2 text-xs">{oidcResult}</p>
          </article>

          <article className="surface-card p-4">
            <h2 className="heading-font text-lg">Resource and Inventory Checks</h2>
            <div className="mt-3 grid gap-2">
              <input className="field" value={resourceURL} onChange={(event) => setResourceURL(event.target.value)} placeholder="Fetch URL" />
              <textarea className="field min-h-20" value={graphqlProbe} onChange={(event) => setGraphqlProbe(event.target.value)} />
              <button className="btn btn-secondary" onClick={() => void runResourceChecks()}>Run Discovery Checks</button>
            </div>
            <p className="mt-3 rounded-12 border border-subtle bg-[var(--surface-soft)] p-2 text-xs">{resourceResult}</p>
          </article>
        </section>

        <section className="surface-card p-4">
          <h2 className="heading-font text-lg">AI / RAG Lab Controls</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Runs current AI endpoints: kb search, embed, and config probe.</p>
          <div className="mt-3 grid gap-2 xl:grid-cols-[1fr_1fr_auto]">
            <input className="field" value={kbQuery} onChange={(event) => setKbQuery(event.target.value)} placeholder="KB search query" />
            <input className="field" value={embedText} onChange={(event) => setEmbedText(event.target.value)} placeholder="Embedding text" />
            <button className="btn btn-primary" onClick={() => void runAILabChecks()}>Run AI Lab Check</button>
          </div>
          <p className="mt-3 rounded-12 border border-subtle bg-[var(--surface-soft)] p-2 text-xs">{aiLabResult}</p>
        </section>
      </section>
    </main>
  );
}
