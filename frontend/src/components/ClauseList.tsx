import { AlertTriangle, FileWarning, Scale, Shield, Siren } from "lucide-react";

import { type ClauseInsight, type MissingClauseInsight } from "@/lib/api";

type ClauseListItem = ClauseInsight | MissingClauseInsight;

function getSeverityClass(severity: ClauseListItem["severity"]) {
  switch (severity) {
    case "critical":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "high":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
}

function getIcon(title: string) {
  const normalized = title.toLowerCase();
  if (normalized.includes("penalt")) return Siren;
  if (normalized.includes("liability") || normalized.includes("risk")) return AlertTriangle;
  if (normalized.includes("governing") || normalized.includes("dispute")) return Scale;
  if (normalized.includes("confidential")) return Shield;
  return FileWarning;
}

export function ClauseList({
  title,
  description,
  clauses,
  emptyMessage,
}: {
  title: string;
  description: string;
  clauses: ClauseListItem[];
  emptyMessage: string;
}) {
  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.1)] backdrop-blur md:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>

      {clauses.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm text-slate-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-4">
          {clauses.map((clause, index) => {
            const Icon = getIcon(clause.title);

            return (
              <article
                key={`${clause.title}-${index}`}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-slate-900 p-2 text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-950">{clause.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{clause.explanation}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getSeverityClass(
                      clause.severity,
                    )}`}
                  >
                    {clause.severity}
                  </span>
                </div>

                {"excerpt" in clause ? (
                  <div className="mt-4 rounded-2xl border border-white bg-white px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                      Contract excerpt
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{clause.excerpt}</p>
                  </div>
                ) : null}

                <div className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-100">
                  <span className="font-semibold text-white">Recommended action:</span>{" "}
                  {clause.recommendation}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
