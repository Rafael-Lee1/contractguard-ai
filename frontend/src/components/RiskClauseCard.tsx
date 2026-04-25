import { AlertTriangle, Lightbulb, ShieldAlert } from "lucide-react";

import type { ClauseInsight } from "@/lib/api";

function getSeverityStyles(severity: ClauseInsight["severity"]) {
  if (severity === "critical") {
    return {
      badge: "border-red-300 bg-red-100 text-red-800",
      icon: "bg-red-100 text-red-800",
      Icon: ShieldAlert,
    };
  }

  return {
    badge: "border-orange-300 bg-orange-100 text-orange-800",
    icon: "bg-orange-100 text-orange-800",
    Icon: AlertTriangle,
  };
}

export function RiskClauseCard({ clause }: { clause: ClauseInsight }) {
  const severity = getSeverityStyles(clause.severity);
  const SeverityIcon = severity.Icon;

  return (
    <article className="animate-fade-in-up rounded-2xl border border-red-200 bg-white p-5 shadow-sm shadow-red-100/70 transition duration-300 hover:-translate-y-1 hover:border-red-300 hover:shadow-lg hover:shadow-red-100">
      <div className="flex items-start gap-4">
        <div className={`rounded-xl p-2.5 ${severity.icon}`}>
          <SeverityIcon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h3 className="text-base font-semibold leading-6 text-slate-950">{clause.title}</h3>
            <span
              className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize ${severity.badge}`}
            >
              {clause.severity}
            </span>
          </div>
        </div>
      </div>

      <div className="my-5 h-px bg-red-100" />

      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-400">
            Explanation
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{clause.explanation}</p>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-700">
            <ShieldAlert className="h-4 w-4" />
            Why this is dangerous
          </div>
          <p className="mt-2 text-sm leading-6 text-red-800">
            {clause.risk_reason || clause.explanation}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <Lightbulb className="h-4 w-4 text-slate-400" />
            Recommendation
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-700">{clause.recommendation}</p>
        </div>
      </div>
    </article>
  );
}
