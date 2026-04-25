import { CalendarClock, FileText, Sparkles } from "lucide-react";

export function AnalysisSummary({
  filename,
  uploadedAt,
  createdAt,
  summary,
}: {
  filename: string;
  uploadedAt?: string;
  createdAt?: string;
  summary: string;
}) {
  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.1)] backdrop-blur md:p-8">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">Analysis Summary</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{filename}</h1>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-slate-600">
          {uploadedAt ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
              <FileText className="h-4 w-4" />
              Uploaded {new Date(uploadedAt).toLocaleDateString()}
            </span>
          ) : null}
          {createdAt ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
              <CalendarClock className="h-4 w-4" />
              Analyzed {new Date(createdAt).toLocaleDateString()}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-6 rounded-[1.5rem] bg-[linear-gradient(135deg,rgba(15,23,42,1),rgba(30,41,59,0.95))] p-6 text-white">
        <div className="flex items-center gap-2 text-emerald-300">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium uppercase tracking-[0.22em]">Executive readout</span>
        </div>
        <p className="mt-4 text-base leading-8 text-slate-100">{summary}</p>
      </div>
    </section>
  );
}
