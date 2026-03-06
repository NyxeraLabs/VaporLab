'use client';

type WorkspaceSwitcherProps = {
  tenant: string;
  onTenantChange: (tenant: string) => void;
};

const tenants = ['tenant-a', 'tenant-b'];

export default function WorkspaceSwitcher({ tenant, onTenantChange }: WorkspaceSwitcherProps) {
  return (
    <div className="surface-card p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">Workspace</p>
      <select value={tenant} onChange={(event) => onTenantChange(event.target.value)} className="field mt-2">
        {tenants.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </div>
  );
}
