"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChevronLeft, LoaderCircle, RefreshCcw } from "lucide-react";

import { AnalysisSummary } from "@/components/AnalysisSummary";
import { ClauseList } from "@/components/ClauseList";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import {
  analyzeContract,
  getContract,
  type AnalysisResponse,
  type ApiError,
  type ContractResponse,
} from "@/lib/api";

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
        setError(apiError.message);
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
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-8 md:px-10 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:border-slate-300"
        >
          <ChevronLeft className="h-4 w-4" />
          Upload another contract
        </Link>

        {isLoading ? (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-slate-950 p-4 text-white">
              <LoaderCircle className="h-8 w-8 animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold text-slate-950">Analyzing contract...</p>
              <p className="mt-2 text-sm text-slate-600">
                Pulling the uploaded document and generating the AI risk readout.
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="mt-10 rounded-[2rem] border border-rose-200 bg-white/90 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.1)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-600">Analysis failed</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
              We couldn&apos;t complete this contract review
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">{error}</p>
            <button
              type="button"
              onClick={() => void retry()}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
            >
              <RefreshCcw className="h-4 w-4" />
              Retry analysis
            </button>
          </div>
        ) : contract && analysis ? (
          <div className="space-y-6 py-8">
            <AnalysisSummary
              filename={contract.filename}
              uploadedAt={contract.uploaded_at}
              createdAt={analysis.created_at}
              summary={analysis.summary}
            />

            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <RiskScoreCard score={analysis.risk_score} />
              <ClauseList
                title="Missing Clauses"
                description="Key protections or structural clauses that appear absent from the contract."
                clauses={analysis.missing_clauses}
                emptyMessage="No major missing clauses were detected in the current analysis."
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <ClauseList
                title="Risk Clauses"
                description="Clauses that introduce legal, financial, or operational exposure."
                clauses={analysis.risk_clauses}
                emptyMessage="No high-signal risk clauses were flagged."
              />
              <ClauseList
                title="Important Clauses"
                description="Material contractual terms that shape control, enforcement, and obligations."
                clauses={analysis.important_clauses}
                emptyMessage="No notable important clauses were extracted."
              />
              <ClauseList
                title="Penalties"
                description="Liquidated damages, penalties, fees, or other punitive payment obligations."
                clauses={analysis.penalties}
                emptyMessage="No penalty clauses were detected."
              />
              <ClauseList
                title="Unilateral Obligations"
                description="One-sided commitments or discretionary powers favoring one party."
                clauses={analysis.unilateral_obligations}
                emptyMessage="No unilateral obligations were identified."
              />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
