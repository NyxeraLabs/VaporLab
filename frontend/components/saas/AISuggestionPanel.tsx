'use client';

import { useEffect, useState } from 'react';
import { runAIQuery } from '../../lib/api';

export default function AISuggestionPanel() {
  const [output, setOutput] = useState('Loading assistant suggestions...');

  useEffect(() => {
    async function loadSuggestion() {
      const result = await runAIQuery('Suggest next sprint priorities for platform reliability.');
      setOutput(result.ok ? JSON.stringify(result.data) : `Error ${result.status}: ${result.error}`);
    }
    void loadSuggestion();
  }, []);

  return (
    <section className="surface-card p-4">
      <h2 className="heading-font text-lg">AI Suggestion Panel</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">
        AI recommendations are generated through workspace assistant services.
      </p>
      <pre className="code-font mt-3 overflow-auto rounded-12 border border-subtle bg-[var(--surface-soft)] p-3 text-xs text-[var(--text-primary)]">
        {output}
      </pre>
    </section>
  );
}
