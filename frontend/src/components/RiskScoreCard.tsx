import { AlertTriangle, CheckCircle2, ShieldAlert, TrendingUp } from "lucide-react";

function getRiskTone(score: number) {
  if (score >= 70) {
    return {
      label: "High Risk",
      description: "Immediate legal review recommended before signing.",
      text: "text-red-700",
      mutedText: "text-red-600",
      border: "border-red-200",
      bg: "bg-red-50",
      softBg: "bg-red-100/70",
      bar: "bg-red-500",
      icon: ShieldAlert,
      glow: "shadow-red-100",
    };
  }

  if (score >= 40) {
    return {
      label: "Medium Risk",
      description: "Review key terms and missing protections before approval.",
      text: "text-yellow-700",
      mutedText: "text-yellow-600",
      border: "border-yellow-200",
      bg: "bg-yellow-50",
      softBg: "bg-yellow-100/70",
      bar: "bg-yellow-500",
      icon: AlertTriangle,
      glow: "shadow-yellow-100",
    };
  }

  return {
    label: "Low Risk",
    description: "No major structural risk signals were detected.",
    text: "text-green-700",
    mutedText: "text-green-600",
    border: "border-green-200",
    bg: "bg-green-50",
    softBg: "bg-green-100/70",
    bar: "bg-green-500",
    icon: CheckCircle2,
    glow: "shadow-green-100",
  };
}

export function RiskScoreCard({ score }: { score: number }) {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const tone = getRiskTone(normalizedScore);
  const Icon = tone.icon;

  return (
    <section className="animate-fade-in-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-950 p-2.5 text-white shadow-sm">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Risk Score
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                Contract exposure
              </h2>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${tone.border} ${tone.bg} ${tone.text}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {tone.label}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <div
            className={`flex h-36 w-36 items-center justify-center rounded-3xl ${tone.bg} ${tone.text} shadow-xl ${tone.glow}`}
          >
            <div className="text-center">
              <div className="text-6xl font-bold tracking-tight">{normalizedScore}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em]">of 100</div>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
            <div className="relative h-4 overflow-hidden rounded-full bg-slate-100">
              <div className="absolute inset-y-0 left-[40%] w-px bg-white/80" />
              <div className="absolute inset-y-0 left-[70%] w-px bg-white/80" />
              <div
                className={`h-full rounded-full ${tone.bar} transition-all duration-700 ease-out`}
                style={{ width: `${normalizedScore}%` }}
              />
            </div>

            <div className={`mt-5 rounded-2xl ${tone.softBg} p-4`}>
              <div className={`flex items-center gap-2 text-sm font-semibold ${tone.text}`}>
                <Icon className="h-4 w-4" />
                {tone.label}
              </div>
              <p className={`mt-2 text-sm leading-6 ${tone.mutedText}`}>{tone.description}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
