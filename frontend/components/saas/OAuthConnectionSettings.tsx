export default function OAuthConnectionSettings() {
  return (
    <section className="surface-card p-4">
      <h2 className="heading-font text-lg">OAuth Connection Settings</h2>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Manage identity provider integration and callbacks.</p>
      <div className="mt-3 grid gap-2">
        <input className="field" defaultValue="https://workspace.local/oauth/callback" />
        <input className="field" defaultValue="workspace-client-id" />
        <input className="field" defaultValue="openid profile email" />
        <div className="flex gap-2">
          <button className="btn btn-secondary">Validate Connection</button>
          <button className="btn btn-ghost">Rotate Secret</button>
        </div>
      </div>
    </section>
  );
}
