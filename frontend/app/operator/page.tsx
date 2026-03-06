'use client';

import { useEffect, useMemo, useState } from 'react';
import DifficultySelector from '../../components/operator/DifficultySelector';
import ExploitChainCanvas from '../../components/operator/ExploitChainCanvas';
import {
  fetchAuthConfig,
  fetchHealth,
  fetchMetricsText,
  fetchModuleControls,
  fetchTelemetryEvents,
  setAuthMode,
  setModuleControl,
  setVulnerabilityControl,
  setVulnerabilityControls,
  type TelemetryEvent,
} from '../../lib/api';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Adversary';

type Vulnerability = {
  key: string;
  title: string;
  module: 'access_control' | 'injection' | 'identity' | 'ai_ml' | 'configuration';
};

const vulnerabilityCatalog: Vulnerability[] = [
  { key: 'jwt_signature_bypass', title: 'JWT Signature Bypass', module: 'identity' },
  { key: 'jwt_alg_none', title: 'JWT alg none', module: 'identity' },
  { key: 'refresh_replay', title: 'Refresh Replay', module: 'identity' },
  { key: 'oidc_insecure_redirect', title: 'OIDC Insecure Redirect', module: 'identity' },
  { key: 'bola_idor', title: 'BOLA IDOR', module: 'access_control' },
  { key: 'mass_assignment_role_escalation', title: 'Mass Assignment Role Escalation', module: 'access_control' },
  { key: 'sensitive_data_exposure', title: 'Sensitive Data Exposure', module: 'access_control' },
  { key: 'users_rate_limit_bypass', title: 'Users Rate Limit Bypass', module: 'access_control' },
  { key: 'coupon_replay', title: 'Coupon Replay', module: 'injection' },
  { key: 'billing_export_command_injection', title: 'Billing Export Command Injection', module: 'injection' },
  { key: 'unsigned_webhook_accepted', title: 'Unsigned Webhook Accepted', module: 'injection' },
  { key: 'admin_promote_unauthz', title: 'Admin Promote Unauthz', module: 'access_control' },
  { key: 'admin_debug_exposure', title: 'Admin Debug Exposure', module: 'access_control' },
  { key: 'internal_ssrf_fetch', title: 'Internal SSRF Fetch', module: 'configuration' },
  { key: 'deep_graphql_accepted', title: 'Deep GraphQL Accepted', module: 'configuration' },
  { key: 'oversized_upload_accepted', title: 'Oversized Upload Accepted', module: 'configuration' },
  { key: 'ssrf_rate_limit_bypass', title: 'SSRF Rate Limit Bypass', module: 'configuration' },
  { key: 'excessive_data_exposure', title: 'Excessive Data Exposure', module: 'configuration' },
  { key: 'internal_route_exposure', title: 'Internal Route Exposure', module: 'configuration' },
  { key: 'shadow_api_exposure', title: 'Shadow API Exposure', module: 'configuration' },
  { key: 'ai_prompt_injection_secret_leak', title: 'AI Prompt Injection Secret Leak', module: 'ai_ml' },
  { key: 'ai_config_api_key_exposure', title: 'AI Config API Key Exposure', module: 'ai_ml' },
  { key: 'vector_poisoning_insert', title: 'Vector Poisoning Insert', module: 'ai_ml' },
  { key: 'ai_log_injection', title: 'AI Log Injection', module: 'ai_ml' },
  { key: 'cross_service_ai_chain', title: 'Cross Service AI Chain', module: 'ai_ml' },
  { key: 'unauthenticated_metrics_exposure', title: 'Unauthenticated Metrics Exposure', module: 'configuration' },
];

const defaultChain = [
  'bola_idor',
  'admin_promote_unauthz',
  'billing_export_command_injection',
  'ai_prompt_injection_secret_leak',
];

const difficultyPresets: Record<Difficulty, string[]> = {
  Beginner: ['bola_idor', 'sensitive_data_exposure', 'coupon_replay', 'ai_prompt_injection_secret_leak'],
  Intermediate: [
    'bola_idor',
    'mass_assignment_role_escalation',
    'billing_export_command_injection',
    'oidc_insecure_redirect',
    'ai_prompt_injection_secret_leak',
  ],
  Advanced: [
    'jwt_signature_bypass',
    'jwt_alg_none',
    'refresh_replay',
    'oidc_insecure_redirect',
    'bola_idor',
    'mass_assignment_role_escalation',
    'billing_export_command_injection',
    'internal_ssrf_fetch',
    'deep_graphql_accepted',
    'ai_prompt_injection_secret_leak',
    'vector_poisoning_insert',
  ],
  Adversary: vulnerabilityCatalog.map((v) => v.key),
};

function parseMetricValue(metricsText: string, key: string) {
  const line = metricsText.split('\n').find((entry) => entry.startsWith(`${key} `));
  if (!line) {
    return 0;
  }
  const value = Number.parseInt(line.split(' ')[1] ?? '0', 10);
  return Number.isNaN(value) ? 0 : value;
}

export default function OperatorPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [runtime, setRuntime] = useState('loading runtime...');
  const [resultLog, setResultLog] = useState('No actions executed.');
  const [metricsSummary, setMetricsSummary] = useState('No telemetry snapshot loaded.');
  const [timeline, setTimeline] = useState<TelemetryEvent[]>([]);
  const [vulnFlags, setVulnFlags] = useState<Record<string, boolean>>({});
  const [moduleFlags, setModuleFlags] = useState<Record<string, boolean>>({});
  const [refreshMs, setRefreshMs] = useState(2000);
  const [chainSelection, setChainSelection] = useState<string[]>(defaultChain);

  const chainNodes = useMemo(() => {
    const selected = chainSelection
      .map((key) => vulnerabilityCatalog.find((v) => v.key === key))
      .filter((value): value is Vulnerability => Boolean(value));
    const count = Math.max(selected.length, 1);
    return selected.map((entry, index) => {
      const step = 860 / Math.max(count-1, 1);
      return {
        id: entry.key,
        title: entry.title,
        active: Boolean(vulnFlags[entry.key]),
        x: 70 + Math.round(step * index),
        y: 100 + ((index % 2) * 90),
      };
    });
  }, [chainSelection, vulnFlags]);

  const pathBars = useMemo(() => {
    const counts: Record<string, number> = {};
    timeline.forEach((event) => {
      counts[event.path] = (counts[event.path] ?? 0) + 1;
    });
    const rows = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    const max = rows[0]?.[1] ?? 1;
    return rows.map(([path, count]) => ({ path, count, pct: Math.round((count / max) * 100) }));
  }, [timeline]);

  const minuteBars = useMemo(() => {
    const counts: Record<string, number> = {};
    timeline.forEach((event) => {
      const minute = event.timestamp.slice(11, 16);
      counts[minute] = (counts[minute] ?? 0) + 1;
    });
    const rows = Object.entries(counts).slice(-8);
    const max = rows.reduce((acc, [, count]) => Math.max(acc, count), 1);
    return rows.map(([minute, count]) => ({ minute, count, pct: Math.round((count / max) * 100) }));
  }, [timeline]);

  async function refreshRuntime() {
    const [healthRes, authCfgRes, moduleRes] = await Promise.all([fetchHealth(), fetchAuthConfig(), fetchModuleControls()]);
    const effectiveSecure = healthRes.effective_secure_mode ?? healthRes.secure_mode;
    const secure = effectiveSecure ? 'HARDENED' : 'VULNERABLE';
    const weak = authCfgRes.ok && authCfgRes.data?.weak_secret ? 'weak-jwt-secret' : 'strong-jwt-secret';
    setRuntime(`${secure} | ${weak}`);
    if (moduleRes.ok) {
      setModuleFlags(moduleRes.data?.modules ?? {});
      setVulnFlags(moduleRes.data?.vulnerabilities ?? {});
    }
  }

  async function refreshObservability() {
    const [metricsRes, eventsRes] = await Promise.all([fetchMetricsText(), fetchTelemetryEvents(120)]);
    if (metricsRes.ok) {
      const total = parseMetricValue(metricsRes.text, 'vaporlab_requests_total');
      const traces = parseMetricValue(metricsRes.text, 'vaporlab_traces_total');
      const blind = parseMetricValue(metricsRes.text, 'vaporlab_blindspot_requests_total');
      setMetricsSummary(`requests=${total} traces=${traces} blindspots=${blind}`);
    } else {
      setMetricsSummary(`metrics unavailable (${metricsRes.status})`);
    }
    if (eventsRes.ok) {
      const events = eventsRes.data?.events ?? [];
      setTimeline(events);
      const lines = events
        .slice()
        .reverse()
        .slice(0, 20)
        .map((event) => `${event.timestamp} ${event.method} ${event.path} trace=${event.trace_id || 'none'} blindspot=${event.blindspot}`)
        .join('\n');
      setResultLog(lines || 'No events recorded.');
    }
  }

  async function toggleVuln(key: string, enabled: boolean) {
    const res = await setVulnerabilityControl(key, enabled);
    if (res.ok) {
      setVulnFlags(res.data?.vulnerabilities ?? {});
    }
  }

  async function toggleAllVulns(enabled: boolean) {
    const payload = Object.fromEntries(vulnerabilityCatalog.map((v) => [v.key, enabled]));
    const res = await setVulnerabilityControls(payload);
    if (res.ok) {
      setVulnFlags(res.data?.vulnerabilities ?? {});
    }
  }

  async function applyDifficulty(level: Difficulty) {
    setDifficulty(level);
    await setAuthMode(false);
    const allowed = new Set(difficultyPresets[level]);
    const payload: Record<string, boolean> = {};
    vulnerabilityCatalog.forEach((v) => {
      payload[v.key] = allowed.has(v.key);
    });
    const res = await setVulnerabilityControls(payload);
    if (res.ok) {
      setVulnFlags(res.data?.vulnerabilities ?? {});
    }
    await refreshRuntime();
  }

  async function toggleModule(module: string, enabled: boolean) {
    const res = await setModuleControl(module, enabled);
    if (res.ok) {
      setModuleFlags(res.data?.modules ?? {});
      setVulnFlags(res.data?.vulnerabilities ?? {});
    }
  }

  function addToChain(key: string) {
    setChainSelection((prev) => (prev.includes(key) ? prev : [...prev, key].slice(-12)));
  }

  useEffect(() => {
    void refreshRuntime();
    void refreshObservability();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void refreshObservability();
    }, refreshMs);
    return () => window.clearInterval(timer);
  }, [refreshMs]);

  return (
    <main className="space-y-4">
      <section className="surface-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">Operator Runtime</p>
            <h2 className="heading-font text-2xl">Attack Surface Control</h2>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={() => void setAuthMode(true)}>Harden API</button>
            <button className="btn btn-danger" onClick={() => void setAuthMode(false)}>Expose API</button>
            <button className="btn btn-ghost" onClick={() => void refreshRuntime()}>Refresh Runtime</button>
            <button className="btn btn-ghost" onClick={() => void refreshObservability()}>Refresh Telemetry</button>
          </div>
        </div>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">Runtime: {runtime}</p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">{metricsSummary}</p>
      </section>

      <section className="grid gap-4 xl:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <DifficultySelector value={difficulty} onChange={(value) => void applyDifficulty(value)} />
          <article className="surface-card p-4">
            <h3 className="heading-font text-lg">Global Controls</h3>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="btn btn-ghost" onClick={() => void toggleAllVulns(true)}>Enable 27/27</button>
              <button className="btn btn-ghost" onClick={() => void toggleAllVulns(false)}>Disable 27/27</button>
            </div>
            <p className="mt-3 text-xs text-[var(--text-secondary)]">Refresh Interval: {refreshMs} ms</p>
            <input
              className="mt-2 w-full"
              type="range"
              min={1000}
              max={10000}
              step={500}
              value={refreshMs}
              onChange={(event) => setRefreshMs(Number.parseInt(event.target.value, 10))}
            />
          </article>
          <article className="surface-card p-4">
            <h3 className="heading-font text-lg">Module Controls</h3>
            <div className="mt-3 space-y-2 text-xs">
              {Object.entries(moduleFlags).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between rounded-12 border border-subtle p-2">
                  <span>{key}</span>
                  <button className="btn btn-ghost" onClick={() => void toggleModule(key, !enabled)}>
                    {enabled ? 'On' : 'Off'}
                  </button>
                </div>
              ))}
            </div>
          </article>
        </div>
        <ExploitChainCanvas difficulty={difficulty} nodes={chainNodes} />
      </section>

      <section className="surface-card p-4">
        <div className="flex items-center justify-between">
          <h3 className="heading-font text-lg">Vulnerability Switchboard (27)</h3>
          <p className="text-xs text-[var(--text-secondary)]">Click to chain vulnerabilities in canvas.</p>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {vulnerabilityCatalog.map((vuln) => {
            const enabled = Boolean(vulnFlags[vuln.key]);
            return (
              <div key={vuln.key} className="rounded-12 border border-subtle bg-[var(--surface-soft)] p-2">
                <p className="text-xs font-semibold">{vuln.title}</p>
                <p className="text-[10px] text-[var(--text-secondary)]">{vuln.key}</p>
                <div className="mt-2 flex gap-2">
                  <button className="btn btn-ghost text-xs" onClick={() => void toggleVuln(vuln.key, !enabled)}>
                    {enabled ? 'On' : 'Off'}
                  </button>
                  <button className="btn btn-ghost text-xs" onClick={() => addToChain(vuln.key)}>
                    Chain
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="surface-card p-4">
          <h3 className="heading-font text-lg">Log Event Rate by Path</h3>
          <div className="mt-3 space-y-2">
            {pathBars.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)]">No event data yet.</p>
            ) : (
              pathBars.map((row) => (
                <div key={row.path} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="code-font">{row.path}</span>
                    <span>{row.count}</span>
                  </div>
                  <div className="h-2 rounded bg-[var(--surface-soft)]">
                    <div className="h-2 rounded bg-[var(--primary)]" style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="surface-card p-4">
          <h3 className="heading-font text-lg">Incident Timeline Throughput</h3>
          <div className="mt-3 space-y-2">
            {minuteBars.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)]">No timeline data yet.</p>
            ) : (
              minuteBars.map((row) => (
                <div key={row.minute} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{row.minute}</span>
                    <span>{row.count}</span>
                  </div>
                  <div className="h-2 rounded bg-[var(--surface-soft)]">
                    <div className="h-2 rounded bg-[var(--secondary)]" style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="surface-card p-4">
        <h3 className="heading-font text-lg">Operator Event Log</h3>
        <pre className="code-font mt-3 max-h-80 overflow-auto rounded-12 border border-subtle bg-[var(--surface-soft)] p-3 text-xs">
          {resultLog}
        </pre>
      </section>
    </main>
  );
}
