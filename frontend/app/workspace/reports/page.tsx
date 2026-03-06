'use client';

import { useState } from 'react';
import AISuggestionPanel from '../../../components/saas/AISuggestionPanel';
import { fetchAPIVersion, fetchOpenAPI, fetchURL, runGraphQLProbe } from '../../../lib/api';

export default function WorkspaceReportsPage() {
  const [resourceURL, setResourceURL] = useState('http://localhost:18080/internal/status');
  const [graphqlProbe, setGraphqlProbe] = useState('{a{b{c{d{e{f}}}}}}');
  const [reportResult, setReportResult] = useState('No report checks executed.');

  async function runReportChecks() {
    const ssrfRes = await fetchURL(resourceURL);
    const graphqlRes = await runGraphQLProbe(graphqlProbe);
    const [v1, v2, beta, internal, openapi] = await Promise.all([
      fetchAPIVersion('v1'),
      fetchAPIVersion('v2'),
      fetchAPIVersion('beta'),
      fetchAPIVersion('internal'),
      fetchOpenAPI(),
    ]);
    setReportResult(
      `fetch=${ssrfRes.status} graph=${graphqlRes.status} v1=${v1.status} v2=${v2.status} beta=${beta.status} internal=${internal.status} schema=${openapi.status}`,
    );
  }

  return (
    <main className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-2">
        <article className="surface-card p-4">
          <h2 className="heading-font text-lg">Service Health Reports</h2>
          <div className="mt-3 grid gap-2">
            <input className="field" value={resourceURL} onChange={(event) => setResourceURL(event.target.value)} placeholder="Preview URL" />
            <textarea className="field min-h-20" value={graphqlProbe} onChange={(event) => setGraphqlProbe(event.target.value)} />
            <button className="btn btn-secondary" onClick={() => void runReportChecks()}>Run Report Checks</button>
          </div>
          <p className="mt-3 rounded-12 border border-subtle bg-[var(--surface-soft)] p-2 text-xs break-all">{reportResult}</p>
        </article>
        <AISuggestionPanel />
      </section>
    </main>
  );
}
