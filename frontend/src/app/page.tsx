import { ContractUploader } from "@/components/ContractUploader";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            AI contract review
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            ContractGuard AI
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Upload a PDF contract, send it to the FastAPI backend, and run the analysis engine.
            Results appear below as formatted JSON for quick inspection.
          </p>
        </header>

        <ContractUploader />
      </div>
    </main>
  );
}
