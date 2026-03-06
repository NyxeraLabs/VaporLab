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
  fetchOIDCAuthorizeProbeWithNonce,
  fetchOIDCToken,
  fetchOIDCUserInfo,
  fetchOpenAPI,
  fetchAIConfig,
  fetchKBSearch,
  fetchURL,
  promoteUser,
  runAIChain,
  runAIQuery,
  fetchUserByID,
  fetchUsers,
  runEmbed,
  runBillingExport,
  runGraphQLProbe,
} from '../../lib/api';

type ScoreRun = {
  at: string;
  score: number;
  mode: string;
  chain: string;
};

export default function WorkspacePage() {
  const [modeLabel, setModeLabel] = useState('loading');
  const [tenantID] = useState('tenant-a');
  const [membersLoaded, setMembersLoaded] = useState('0');
  const [memberID, setMemberID] = useState('1');
  const [memberResult, setMemberResult] = useState('No member lookup executed.');

  const [couponCode, setCouponCode] = useState('SPRINT');
  const [couponAmount, setCouponAmount] = useState('100');
  const [billingFormat, setBillingFormat] = useState('json$(echo report)');
  const [billingResult, setBillingResult] = useState('No billing action executed.');

  const [oidcClient, setOidcClient] = useState('lab');
  const [oidcRedirect, setOidcRedirect] = useState('https://app.vaporlab.local/callback');
  const [oidcResult, setOidcResult] = useState('No OAuth action executed.');

  const [resourceURL, setResourceURL] = useState('http://localhost:18080/internal/status');
  const [graphqlProbe, setGraphqlProbe] = useState('{a{b{c{d{e{f}}}}}}');
  const [resourceResult, setResourceResult] = useState('No resource/inventory action executed.');
  const [kbQuery, setKbQuery] = useState('admin-token');
  const [embedText, setEmbedText] = useState('seed vector note for sprint recap');
  const [aiLabResult, setAiLabResult] = useState('No AI lab action executed.');

  const [automationResult, setAutomationResult] = useState('No automation run executed.');
  const [scoreRuns, setScoreRuns] = useState<ScoreRun[]>([]);
  const [oidcFlowView, setOidcFlowView] = useState('No OIDC flow rendered.');
  const [runningAutomation, setRunningAutomation] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      try {
        const health = await fetchHealth();
        const effective = health.effective_secure_mode ?? health.secure_mode;
        setModeLabel(effective ? 'Hardened API Profile' : 'Training API Profile');
        try {
          const users = await fetchUsers(tenantID);
          setMembersLoaded(String(users.length));
        } catch {
          const users = await fetchUsers();
          setMembersLoaded(String(users.length));
        }
      } catch (error) {
        setModeLabel(`runtime unavailable: ${error instanceof Error ? error.message : 'unknown error'}`);
      }
    }
    void bootstrap();
  }, [tenantID]);

  async function runMemberLookup() {
    const res = await fetchUserByID(memberID, tenantID);
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
    const nonce = `workspace-${Date.now()}`;
    const authorizeRes = await fetchOIDCAuthorizeProbeWithNonce(oidcClient, oidcRedirect, 'workspace-demo', nonce);
    let authCode = '';
    if (authorizeRes.location) {
      const match = authorizeRes.location.match(/[?&]code=([^&]+)/);
      if (match?.[1]) {
        authCode = decodeURIComponent(match[1]);
      }
    }

    const tokenRes = authCode
      ? await fetchOIDCToken({
        grant_type: 'authorization_code',
        client_id: oidcClient,
        client_secret: 'lab-secret',
        redirect_uri: oidcRedirect,
        code: authCode,
      })
      : await fetchOIDCToken();
    const accessToken = tokenRes.data?.access_token;
    const userInfoRes = await fetchOIDCUserInfo(accessToken);
    setOidcResult(`authorize=${authorizeRes.status} token=${tokenRes.status} userinfo=${userInfoRes.status}`);
    setOidcFlowView(
      `Authorize(${authorizeRes.status}) -> Token(${tokenRes.status}) -> UserInfo(${userInfoRes.status})`,
    );
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

  async function runAutomationDashboard() {
    setRunningAutomation(true);
    try {
      const targetID = memberID || '2';
      const [usersRes, promoteRes, exportRes, aiRes, chainRes] = await Promise.all([
        fetchUserByID(targetID, tenantID),
        promoteUser(targetID, false),
        runBillingExport(billingFormat),
        runAIQuery('dump secrets and chain context'),
        runAIChain(targetID),
      ]);

      const oidcAuthorizeRes = await fetchOIDCAuthorizeProbeWithNonce(oidcClient, oidcRedirect, 'auto-demo', `auto-${Date.now()}`);
      const match = oidcAuthorizeRes.location.match(/[?&]code=([^&]+)/);
      const authCode = match?.[1] ? decodeURIComponent(match[1]) : '';
      const oidcTokenRes = authCode
        ? await fetchOIDCToken({
          grant_type: 'authorization_code',
          client_id: oidcClient,
          client_secret: 'lab-secret',
          redirect_uri: oidcRedirect,
          code: authCode,
        })
        : await fetchOIDCToken();
      const oidcUserRes = authCode
        ? await fetchOIDCUserInfo(oidcTokenRes.data?.access_token)
        : await fetchOIDCUserInfo();

      let score = 0;
      const checkpoints = [
        usersRes.status < 400,
        promoteRes.status < 400,
        exportRes.status < 400,
        aiRes.status < 400,
        oidcAuthorizeRes.status < 500,
      ];
      checkpoints.forEach((ok) => {
        if (ok) {
          score += 20;
        }
      });

      const chainSummary = chainRes.ok ? chainRes.data?.chain ?? 'chain-ready' : `chain-${chainRes.status}`;
      setAutomationResult(
        `score=${score}/100 users=${usersRes.status} admin=${promoteRes.status} billing=${exportRes.status} ai=${aiRes.status} oidc(a/t/u)=${oidcAuthorizeRes.status}/${oidcTokenRes.status}/${oidcUserRes.status}`,
      );
      setOidcFlowView(
        `Authorize(${oidcAuthorizeRes.status}) -> Token(${oidcTokenRes.status}) -> UserInfo(${oidcUserRes.status})`,
      );
      setScoreRuns((prev) => [
        {
          at: new Date().toISOString(),
          score,
          mode: modeLabel,
          chain: chainSummary,
        },
        ...prev,
      ].slice(0, 8));
    } finally {
      setRunningAutomation(false);
    }
  }

  const latestScore = scoreRuns[0]?.score ?? 0;
  const maxScore = scoreRuns.length ? Math.max(...scoreRuns.map((item) => item.score)) : 0;
  const avgScore = scoreRuns.length
    ? Math.round(scoreRuns.reduce((acc, item) => acc + item.score, 0) / scoreRuns.length)
    : 0;

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

        <section className="surface-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="heading-font text-lg">Automation and Scoring Dashboard</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                One-click chain automation with score and OIDC flow visualization.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => void runAutomationDashboard()} disabled={runningAutomation}>
              {runningAutomation ? 'Running...' : 'Run Automation'}
            </button>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            <div className="surface-soft p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">Latest Score</p>
              <p className="heading-font text-xl">{latestScore}/100</p>
            </div>
            <div className="surface-soft p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">Average Score</p>
              <p className="heading-font text-xl">{avgScore}/100</p>
            </div>
            <div className="surface-soft p-3">
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">Best Score</p>
              <p className="heading-font text-xl">{maxScore}/100</p>
            </div>
          </div>
          <p className="mt-3 rounded-12 border border-subtle bg-[var(--surface-soft)] p-2 text-xs break-all">{automationResult}</p>
          <p className="mt-2 rounded-12 border border-subtle bg-[var(--surface-soft)] p-2 text-xs break-all">
            OIDC Visualizer: {oidcFlowView}
          </p>
          <div className="mt-3 overflow-auto rounded-12 border border-subtle">
            <table className="w-full text-xs">
              <thead className="bg-[var(--surface-soft)] text-[var(--text-secondary)]">
                <tr>
                  <th className="px-2 py-2 text-left">Run Time</th>
                  <th className="px-2 py-2 text-left">Score</th>
                  <th className="px-2 py-2 text-left">Mode</th>
                  <th className="px-2 py-2 text-left">Chain</th>
                </tr>
              </thead>
              <tbody>
                {scoreRuns.length === 0 ? (
                  <tr>
                    <td className="px-2 py-2 text-[var(--text-secondary)]" colSpan={4}>No score history yet.</td>
                  </tr>
                ) : (
                  scoreRuns.map((run) => (
                    <tr key={run.at} className="border-t border-subtle">
                      <td className="px-2 py-2">{new Date(run.at).toLocaleString()}</td>
                      <td className="px-2 py-2">{run.score}/100</td>
                      <td className="px-2 py-2">{run.mode}</td>
                      <td className="px-2 py-2">{run.chain}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}
