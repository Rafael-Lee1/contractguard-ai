import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 md:px-10 lg:px-12">
        <header className="flex items-center justify-between">
          <div className="inline-flex items-center gap-3">
            <div className="rounded-2xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
              CG
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-950">ContractGuard AI</p>
              <p className="text-sm text-slate-500">Legal risk intelligence for modern teams</p>
            </div>
          </div>
          <Link
            href="/upload"
            className="hidden rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm backdrop-blur transition hover:border-slate-300 md:inline-flex"
          >
            Open workspace
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
              <Sparkles className="h-4 w-4" />
              AI Contract Review
            </span>
            <h1 className="mt-8 max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              ContractGuard AI
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-600">
              AI-powered contract risk analysis platform.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-500">
              Upload agreements, surface hidden exposure, and move from dense legal text to a
              practical decision-ready summary in minutes.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/upload"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 transition hover:bg-slate-800"
              >
                Analyze Contract
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-medium text-slate-600 backdrop-blur">
                PDF and DOCX support
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[2rem] border border-white/70 bg-white/90 p-7 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur">
              <div className="flex items-center gap-3 text-emerald-700">
                <ShieldCheck className="h-5 w-5" />
                <p className="text-sm font-semibold uppercase tracking-[0.22em]">Risk triage</p>
              </div>
              <p className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                See risky clauses before they become expensive commitments.
              </p>
              <div className="mt-6 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500" />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">
                  Output
                </p>
                <p className="mt-4 text-lg font-medium leading-8 text-slate-100">
                  Summary, score, missing protections, penalties, and unilateral obligations.
                </p>
              </div>
              <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur">
                <div className="flex items-center gap-3 text-amber-700">
                  <TrendingUp className="h-5 w-5" />
                  <p className="text-sm font-semibold uppercase tracking-[0.22em]">Decision velocity</p>
                </div>
                <p className="mt-4 text-lg font-medium leading-8 text-slate-700">
                  Built for procurement, operations, founders, and legal teams that need signal fast.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
