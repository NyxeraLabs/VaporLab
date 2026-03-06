'use client';

import { useEffect, useState } from 'react';
import DifficultySelector from '../../components/operator/DifficultySelector';
import ExploitChainCanvas from '../../components/operator/ExploitChainCanvas';
import VulnerabilityCard from '../../components/operator/VulnerabilityCard';
import {
  fetchAuthConfig,
  fetchHealth,
  fetchModuleControls,
  fetchMetricsText,
  fetchTenantManagement,
  fetchTelemetryEvents,
  probeChain,
  setModuleControl,
  setAuthMode,
  type TelemetryEvent,
} from '../../lib/api';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Adversary';
type ModuleState = {
  title: string;
  description: string;
  category: 'Access Control' | 'Injection' | 'Identity' | 'AI/ML' | 'Configuration';
  active: boolean;
};

const baseModules: ModuleState[] = [
  {
    title: 'Broken Object Level Authorization',
    description: 'Cross-tenant object access checks can be relaxed for training sequences.',
    category: 'Access Control' as const,
    active: true,
  },
  {
    title: 'Command Injection Surface',
    description: 'Export format execution path can be hardened or left intentionally weak.',
    category: 'Injection' as const,
    active: true,
  },
  {
    title: 'OAuth Misconfiguration',
    description: 'Redirect and signature controls can be toggled to shape identity abuse.',
    category: 'Identity' as const,
    active: false,
  },
  {
    title: 'Prompt Chaining Exposure',
    description: 'AI controls can permit prompt exfiltration and poisoning scenarios.',
    category: 'AI/ML' as const,
    active: false,
  },
  {
    title: 'Inventory Drift',
    description: 'Legacy and hidden endpoints can be surfaced or blocked by policy profile.',
    category: 'Configuration' as const,
    active: true,
  },
];

export default function OperatorPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('Intermediate');
  const [modules, setModules] = useState<ModuleState[]>(baseModules);
  const [runtime, setRuntime] = useState('loading runtime...');
  const [chainSignal, setChainSignal] = useState('chain not loaded');
  const [resultLog, setResultLog] = useState('No actions executed.');
  const [metricsSummary, setMetricsSummary] = useState('No telemetry snapshot loaded.');
  const [blindspotState, setBlindspotState] = useState('No blind-spot analysis yet.');
  const [timeline, setTimeline] = useState<TelemetryEvent[]>([]);
  const [secureRuntime, setSecureRuntime] = useState(false);
  const [labScore, setLabScore] = useState(0);

  function moduleToKey(title: string): string {
    switch (title) {
      case 'Broken Object Level Authorization':
        return 'access_control';
      case 'Command Injection Surface':
        return 'injection';
      case 'OAuth Misconfiguration':
        return 'identity';
      case 'Prompt Chaining Exposure':
        return 'ai_ml';
      case 'Inventory Drift':
        return 'configuration';
      default:
        return '';
    }
  }

  async function updateModule(title: string, active: boolean) {
    const key = moduleToKey(title);
    if (!key) {
      return;
    }
    const res = await setModuleControl(key, active);
    if (!res.ok) {
      appendLog(`module update failed (${key}) -> ${res.status} ${res.error}`);
      return;
    }
    setModules((prev) => prev.map((item) => (item.title === title ? { ...item, active } : item)));
    appendLog(`module ${key} -> ${active ? 'on' : 'off'}`);
    await refreshRuntime();
  }

  function appendLog(message: string) {
    setResultLog((prev) => `${message}\n${prev}`.slice(0, 1400));
  }

  async function refreshRuntime() {
    const [healthRes, authCfgRes, tenantRes, chainRes, moduleRes] = await Promise.all([
      fetchHealth(),
      fetchAuthConfig(),
      fetchTenantManagement(),
      probeChain(),
      fetchModuleControls(),
    ]);
    const effectiveSecure = healthRes.effective_secure_mode ?? healthRes.secure_mode;
    const secure = effectiveSecure ? 'HARDENED' : 'VULNERABLE';
    setSecureRuntime(effectiveSecure);
    const weak = authCfgRes.ok && authCfgRes.data?.weak_secret ? 'weak-jwt-secret' : 'strong-jwt-secret';
    const tenantState = tenantRes.ok && tenantRes.data?.unsafe ? 'unsafe-tenant-admin' : 'tenant-controls-on';
    setRuntime(`${secure} | ${weak} | ${tenantState}`);
    setChainSignal(chainRes.data?.chain ?? `chain unavailable (${chainRes.status})`);
    if (moduleRes.ok && moduleRes.data?.modules) {
      const activeMap = moduleRes.data.modules;
      setModules((prev) =>
        prev.map((item) => {
          const key = moduleToKey(item.title);
          if (!key) {
            return item;
          }
          return { ...item, active: Boolean(activeMap[key]) };
        }),
      );
      const enabledCount = Object.values(activeMap).filter(Boolean).length;
      setLabScore(Math.round((enabledCount / 5) * 100));
    }
  }

  async function applyMode(secureMode: boolean) {
    const response = await setAuthMode(secureMode);
    if (response.ok) {
      appendLog(`auth/mode -> secure_mode=${String(response.data?.secure_mode)}`);
      await refreshRuntime();
      return;
    }
    appendLog(`auth/mode failed -> ${response.status} ${response.error}`);
  }

  function parseMetricValue(metricsText: string, key: string) {
    const line = metricsText.split('\n').find((entry) => entry.startsWith(`${key} `));
    if (!line) {
      return 0;
    }
    const value = Number.parseInt(line.split(' ')[1] ?? '0', 10);
    return Number.isNaN(value) ? 0 : value;
  }

  async function refreshObservability() {
    const [metricsRes, eventsRes] = await Promise.all([fetchMetricsText(), fetchTelemetryEvents(24)]);
    if (!metricsRes.ok) {
      setMetricsSummary(`metrics unavailable (${metricsRes.status})`);
      return;
    }
    const total = parseMetricValue(metricsRes.text, 'vaporlab_requests_total');
    const traces = parseMetricValue(metricsRes.text, 'vaporlab_traces_total');
    const blind = parseMetricValue(metricsRes.text, 'vaporlab_blindspot_requests_total');
    setMetricsSummary(`requests=${total} traces=${traces} blindspots=${blind}`);
    if (traces < total - blind) {
      setBlindspotState('Missing telemetry detected: traced request count is below expected non-blindspot traffic.');
    } else if (blind > 0) {
      setBlindspotState('Blind-spot paths active: expected trace/log coverage gaps present.');
    } else {
      setBlindspotState('No blind-spot indicators found in current sample.');
    }
    if (eventsRes.ok) {
      setTimeline(eventsRes.data?.events ?? []);
    }
  }

  useEffect(() => {
    void refreshRuntime();
    void refreshObservability();
  }, []);

  return (
    <main className="space-y-4">
      <section className="surface-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-secondary)]">Lab Runtime</p>
            <h2 className="heading-font text-2xl">Scenario Control Matrix</h2>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary" onClick={() => void applyMode(true)}>Harden API</button>
            <button className="btn btn-danger" onClick={() => void applyMode(false)}>Expose Lab Surface</button>
            <button className="btn btn-ghost" onClick={() => void refreshRuntime()}>Refresh Runtime</button>
            <button className="btn btn-ghost" onClick={() => void refreshObservability()}>Refresh Telemetry</button>
          </div>
        </div>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">Runtime: {runtime}</p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">Chain: {chainSignal}</p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">Lab Vulnerability Score: {labScore}/100</p>
      </section>

      <DifficultySelector value={difficulty} onChange={setDifficulty} />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <div key={module.title} className="space-y-2">
            <VulnerabilityCard
              title={module.title}
              description={module.description}
              category={module.category}
              active={module.active}
            />
            <div className="flex gap-2">
              <button className="btn btn-ghost text-xs" onClick={() => void updateModule(module.title, true)}>Module On</button>
              <button className="btn btn-ghost text-xs" onClick={() => void updateModule(module.title, false)}>Module Off</button>
            </div>
          </div>
        ))}
      </section>

      <ExploitChainCanvas />

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="surface-card p-4">
          <h3 className="heading-font text-lg">Observability Summary</h3>
          <p className="mt-2 rounded-12 border border-subtle bg-[var(--surface-soft)] p-2 text-xs">{metricsSummary}</p>
          <p className="mt-2 rounded-12 border border-subtle bg-[var(--surface-soft)] p-2 text-xs">{blindspotState}</p>
        </article>
        <article className="surface-card p-4">
          <h3 className="heading-font text-lg">Missing-Telemetry Flags</h3>
          <ul className="mt-2 space-y-2 text-xs text-[var(--text-secondary)]">
            <li>Expected blindspot endpoint: `/admin/debug`</li>
            <li>Expected vulnerable blindspot endpoint: `/ai/logs/ingest`</li>
            <li>Verify trace header coverage via workspace/operator interactions.</li>
          </ul>
        </article>
      </section>

      <section className="surface-card p-4">
        <h3 className="heading-font text-lg">Vulnerable vs Secure UI Matrix</h3>
        <div className="mt-3 overflow-auto rounded-12 border border-subtle bg-[var(--surface-soft)]">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[var(--text-secondary)]">
                <th className="px-2 py-2 text-left">Control Surface</th>
                <th className="px-2 py-2 text-left">Vulnerable</th>
                <th className="px-2 py-2 text-left">Secure</th>
                <th className="px-2 py-2 text-left">Current</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['OIDC Redirects', 'Insecure redirect accepted', 'HTTPS redirect required'],
                ['UserInfo Token Check', 'May allow unauthenticated access', 'Bearer token required'],
                ['SSRF/Internal Fetch', 'Internal targets reachable', 'Internal targets blocked'],
                ['AI Secret Exposure', 'Prompt extraction can leak context', 'Constrained response behavior'],
              ].map((row) => (
                <tr key={row[0]} className="border-t border-subtle">
                  <td className="px-2 py-2">{row[0]}</td>
                  <td className="px-2 py-2">{row[1]}</td>
                  <td className="px-2 py-2">{row[2]}</td>
                  <td className="px-2 py-2">{secureRuntime ? 'Secure' : 'Vulnerable'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="surface-card p-4">
        <h3 className="heading-font text-lg">Incident Timeline (Logged Events)</h3>
        <div className="mt-3 max-h-72 overflow-auto rounded-12 border border-subtle bg-[var(--surface-soft)] p-2">
          {timeline.length === 0 ? (
            <p className="text-xs text-[var(--text-secondary)]">No timeline events captured.</p>
          ) : (
            <ol className="space-y-2 text-xs">
              {timeline.map((event, idx) => (
                <li key={`${event.timestamp}-${event.path}-${idx}`} className="rounded-12 border border-subtle bg-[var(--surface)] p-2">
                  <p className="code-font">{event.timestamp} | {event.method} {event.path}</p>
                  <p className="text-[var(--text-secondary)]">
                    trace={event.trace_id || 'none'} blindspot={event.blindspot ? 'true' : 'false'}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
      <section className="surface-card p-4">
        <h3 className="heading-font text-lg">Operator Event Log</h3>
        <pre className="code-font mt-3 overflow-auto rounded-12 border border-subtle bg-[var(--surface-soft)] p-3 text-xs">
          {resultLog}
        </pre>
      </section>
    </main>
  );
}
