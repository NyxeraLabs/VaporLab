type BoardIssue = {
  key: string;
  title: string;
  owner: string;
};

const columns: Record<string, BoardIssue[]> = {
  Planned: [
    { key: 'NX-211', title: 'Finalize OAuth provider mapping', owner: 'Priya' },
    { key: 'NX-227', title: 'Add workspace member filters', owner: 'Omar' },
  ],
  Active: [
    { key: 'NX-230', title: 'Billing statement export updates', owner: 'Lina' },
    { key: 'NX-234', title: 'AI summary confidence labels', owner: 'Mika' },
  ],
  Review: [{ key: 'NX-219', title: 'Issue ACL review pass', owner: 'Davi' }],
};

export default function ProjectBoard() {
  return (
    <section className="surface-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="heading-font text-xl">Project Board</h2>
        <button className="btn btn-primary">Create Issue</button>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {Object.entries(columns).map(([label, issues]) => (
          <div key={label} className="surface-soft p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">{label}</p>
            <div className="mt-2 space-y-2">
              {issues.map((issue) => (
                <article key={issue.key} className="rounded-12 border border-subtle bg-[var(--surface)] p-3">
                  <p className="text-xs text-[var(--secondary)]">{issue.key}</p>
                  <p className="mt-1 text-sm">{issue.title}</p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">{issue.owner}</p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
