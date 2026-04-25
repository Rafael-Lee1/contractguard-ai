import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { ContractUploader } from "@/components/ContractUploader";

export default function UploadPage() {
  return (
    <main className="min-h-screen px-6 py-8 md:px-10 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:border-slate-300"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to home
        </Link>

        <section className="mt-8 mb-8 max-w-3xl">
          <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
            Upload contract
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Start a new contract analysis
          </h1>
          <p className="mt-4 text-base leading-8 text-slate-600">
            Drag in an agreement or select a file manually. Once upload completes, ContractGuard AI
            will take you straight to the analysis workspace.
          </p>
        </section>

        <ContractUploader />
      </div>
    </main>
  );
}
