import { AlertCircle, CheckCircle2, Lightbulb, ShieldAlert } from "lucide-react";

import type { MissingClauseInsight, Severity } from "@/lib/api";

function getSeverityStyles(severity: Severity) {
  switch (severity) {
    case "critical":
    case "high":
      return {
        badge: "border-red-200 bg-red-50 text-red-700",
        icon: "bg-red-50 text-red-700",
        Icon: ShieldAlert,
      };
    case "medium":
      return {
        badge: "border-yellow-200 bg-yellow-50 text-yellow-700",
        icon: "bg-yellow-50 text-yellow-700",
        Icon: AlertCircle,
      };
    default:
      return {
        badge: "border-green-200 bg-green-50 text-green-700",
        icon: "bg-green-50 text-green-700",
        Icon: CheckCircle2,
      };
  }
}

export function ClauseCard({ clause }: { clause: MissingClauseInsight }) {
  const severity = getSeverityStyles(clause.severity);
  const SeverityIcon = severity.Icon;

  return (
    <article className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60 transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
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

      <div className="my-5 h-px bg-slate-100" />

      <div className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Explanation
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{clause.explanation}</p>
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
