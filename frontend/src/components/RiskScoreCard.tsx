import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

function getScoreTone(score: number) {
  if (score <= 30) {
    return {
      label: "Low risk",
      stroke: "#16a34a",
      track: "#dcfce7",
      icon: CheckCircle2,
      accent: "text-emerald-700",
      chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (score <= 60) {
    return {
      label: "Moderate risk",
      stroke: "#d97706",
      track: "#fef3c7",
      icon: AlertTriangle,
      accent: "text-amber-700",
      chip: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  return {
    label: "High risk",
    stroke: "#dc2626",
    track: "#fee2e2",
    icon: ShieldAlert,
    accent: "text-rose-700",
    chip: "bg-rose-50 text-rose-700 border-rose-200",
  };
}

export function RiskScoreCard({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;
  const tone = getScoreTone(score);
  const Icon = tone.icon;

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.1)] backdrop-blur md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Risk Score</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
            Contract exposure snapshot
          </h2>
        </div>
        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tone.chip}`}>
          {tone.label}
        </span>
      </div>

      <div className="mt-8 flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
        <div className="relative flex items-center justify-center">
          <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
            <circle cx="75" cy="75" r={radius} stroke={tone.track} strokeWidth="12" fill="none" />
            <circle
              cx="75"
              cy="75"
              r={radius}
              stroke={tone.stroke}
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold tracking-tight text-slate-950">{score}</span>
            <span className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">out of 100</span>
          </div>
        </div>

        <div className="w-full max-w-sm rounded-[1.5rem] bg-slate-50 p-5">
          <div className={`flex items-center gap-3 ${tone.accent}`}>
            <Icon className="h-5 w-5" />
            <p className="font-semibold">{tone.label}</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This score blends detected risk clauses, missing protections, penalties, and one-sided
            obligations into a single contract health indicator.
          </p>
        </div>
      </div>
    </section>
  );
}
