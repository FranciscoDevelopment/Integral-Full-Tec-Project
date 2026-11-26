import { formatMoney, progressPercent } from "../utils";

interface ProgressBarProps {
  raised: number;
  goal: number;
}

// The total raised comes from Contributions (D5); the bar is drawn here
export function ProgressBar({ raised, goal }: ProgressBarProps) {
  const percent = progressPercent(raised, goal);

  return (
    <section aria-label="Progreso hacia la meta" className="flex flex-col gap-2">
      <p className="flex items-baseline justify-between text-sm">
        <span className="text-lg font-semibold text-slate-900">
          {formatMoney(raised)}
        </span>
        <span className="text-slate-600">de {formatMoney(goal)}</span>
      </p>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${percent}% de la meta`}
        className="h-3 w-full overflow-hidden rounded-full bg-slate-100"
      >
        <div
          className="h-full rounded-full bg-brand-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-sm text-slate-600">{percent}% de la meta</p>
    </section>
  );
}
