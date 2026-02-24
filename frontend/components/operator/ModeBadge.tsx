export type OperatorMode = 'VULNERABLE' | 'HARDENED' | 'MIXED';

type ModeBadgeProps = {
  mode: OperatorMode;
};

const modeClass: Record<OperatorMode, string> = {
  VULNERABLE: 'text-[var(--mode-vulnerable)] border-[var(--mode-vulnerable)]',
  HARDENED: 'text-[var(--mode-hardened)] border-[var(--mode-hardened)]',
  MIXED: 'text-[var(--mode-mixed)] border-[var(--mode-mixed)]',
};

export default function ModeBadge({ mode }: ModeBadgeProps) {
  return (
    <div
      className={`surface-soft z-badge fixed right-4 top-4 border px-3 py-2 text-xs font-semibold tracking-[0.12em] ${modeClass[mode]}`}
      aria-live="polite"
    >
      {mode}
    </div>
  );
}
