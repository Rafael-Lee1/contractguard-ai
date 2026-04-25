"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, ArrowLeft, Layers3, RefreshCcw } from "lucide-react";

import { AnalysisSummary } from "@/components/AnalysisSummary";
import { ClauseCard } from "@/components/ClauseCard";
import { RiskClauseCard } from "@/components/RiskClauseCard";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import {
  analyzeContract,
  getContract,
  type AnalysisResponse,
  type ApiError,
  type ContractResponse,
} from "@/lib/api";

function LoadingSpinner() {
  return (
    <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-950" />
  );
}

export default function AnalysisPage() {
  const params = useParams<{ id: string }>();
  const contractId = params.id;
  const [contract, setContract] = useState<ContractResponse | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contractId) {
      return;
    }

    let active = true;

    async function loadAnalysis() {
      setIsLoading(true);
      setError(null);

      try {
        const [contractResponse, analysisResponse] = await Promise.all([
          getContract(contractId),
          analyzeContract(contractId),
        ]);

        if (!active) {
          return;
        }

        setContract(contractResponse);
        setAnalysis(analysisResponse);
      } catch (requestError) {
        if (!active) {
          return;
        }

        const apiError = requestError as ApiError;
        setError(apiError.message || "Failed to load contract analysis.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadAnalysis();

    return () => {
      active = false;
    };
  }, [contractId]);

  async function retry() {
    if (!contractId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [contractResponse, analysisResponse] = await Promise.all([
        getContract(contractId),
        analyzeContract(contractId),
      ]);

      setContract(contractResponse);
      setAnalysis(analysisResponse);
    } catch (requestError) {
      const apiError = requestError as ApiError;
      setError(apiError.message || "Failed to load contract analysis.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 text-slate-950 md:px-10 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Upload another contract
        </Link>

        {isLoading ? (
          <section className="animate-fade-in mt-10 flex min-h-[55vh] flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/70">
            <LoadingSpinner />
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                Loading analysis
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Fetching the contract and preparing the dashboard.
              </p>
            </div>
          </section>
        ) : error ? (
          <section className="animate-fade-in-up mt-10 rounded-2xl border border-red-200 bg-red-50 p-8 shadow-sm">
            <div className="flex items-center gap-3 text-red-700">
              <div className="rounded-xl bg-red-100 p-2.5">
                <AlertCircle className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                Analysis failed
              </p>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
              We could not complete this contract review
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => void retry()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry analysis
            </button>
          </section>
        ) : contract && analysis ? (
          <section className="animate-fade-in-up space-y-6 py-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                  <Layers3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Dashboard
                  </p>
                  <h1 className="mt-1 text-4xl font-bold tracking-tight text-slate-950">
                    Contract Analysis
                  </h1>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <RiskScoreCard score={analysis.risk_score} />
              <AnalysisSummary summary={analysis.summary} filename={contract.filename} />
            </div>

            <section className="rounded-2xl border border-red-200 bg-red-50/70 p-6 shadow-sm shadow-red-100/70">
              <div className="mb-5 flex flex-col gap-2 border-b border-red-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                      Detected Risk Clauses
                    </p>
                  </div>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                    Clauses that may be harmful or abusive
                  </h2>
                </div>
                <span className="text-sm text-red-700">
                  {analysis.risk_clauses.length} found
                </span>
              </div>

              {analysis.risk_clauses.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {analysis.risk_clauses.map((clause) => (
                    <RiskClauseCard key={`${clause.title}-${clause.severity}`} clause={clause} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-red-200 bg-white px-5 py-8 text-center text-sm text-red-700">
                  No explicit risk clauses detected
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 shadow-sm shadow-slate-200/60">
              <div className="mb-5 flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Missing Clauses
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                    Gaps requiring attention
                  </h2>
                </div>
                <span className="text-sm text-slate-500">
                  {analysis.missing_clauses.length} found
                </span>
              </div>

              {analysis.missing_clauses.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {analysis.missing_clauses.map((clause) => (
                    <ClauseCard key={`${clause.title}-${clause.severity}`} clause={clause} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center text-sm text-slate-500">
                  No missing clauses were detected in this contract.
                </div>
              )}
            </section>
          </section>
        ) : null}
      </div>
    </main>
  );
}
