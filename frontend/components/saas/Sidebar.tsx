const navItems = ['Home', 'Projects', 'Backlog', 'Roadmap', 'Reports', 'Settings'];

export default function Sidebar() {
  return (
    <aside className="rounded-16 bg-[var(--sidebar)] p-4 text-[var(--surface)]">
      <div className="surface-soft p-3">
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">NimbusFlow</p>
        <h2 className="mt-1 heading-font text-xl font-semibold text-[var(--text-primary)]">Workspace</h2>
      </div>
      <nav className="mt-5 space-y-1 text-sm">
        {navItems.map((item, index) => (
          <a
            key={item}
            href="#"
            className={`block rounded-12 px-3 py-2 transition duration-normal ${index === 1 ? 'bg-[var(--primary)] text-[var(--surface)] font-semibold' : 'text-[var(--surface)] hover:bg-[var(--secondary)]'}`}
          >
            {item}
          </a>
        ))}
      </nav>
    </aside>
  );
}
