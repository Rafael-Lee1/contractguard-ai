import { FileText, Sparkles } from "lucide-react";

export function AnalysisSummary({
  summary,
  filename,
}: {
  summary: string;
  filename?: string;
}) {
  return (
    <section className="animate-fade-in-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Summary
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Executive overview
            </h2>
          </div>
        </div>
      </div>

      <div className="p-6">
        {filename ? (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
            <FileText className="h-4 w-4 text-slate-400" />
            <span className="truncate">{filename}</span>
          </div>
        ) : null}

        <p className="text-base leading-8 text-slate-700">
          {summary || "No summary was returned for this contract."}
        </p>
      </div>
    </section>
  );
}
