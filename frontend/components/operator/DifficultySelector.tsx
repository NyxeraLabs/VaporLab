'use client';

type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Adversary';

type DifficultySelectorProps = {
  value: Difficulty;
  onChange: (value: Difficulty) => void;
};

const levelClasses: Record<Difficulty, string> = {
  Beginner: 'border-[var(--diff-beginner)] text-[var(--diff-beginner)]',
  Intermediate: 'border-[var(--diff-intermediate)] text-[var(--diff-intermediate)]',
  Advanced: 'border-[var(--diff-advanced)] text-[var(--diff-advanced)]',
  Adversary: 'border-[var(--diff-adversary)] text-[var(--diff-adversary)]',
};

const levels: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced', 'Adversary'];

export default function DifficultySelector({ value, onChange }: DifficultySelectorProps) {
  return (
    <div className="surface-card p-4">
      <p className="heading-font text-sm uppercase tracking-[0.14em]">Difficulty</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {levels.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={`btn btn-ghost border ${levelClasses[level]} ${value === level ? 'ring-1 ring-[var(--primary)]' : ''}`}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
}
