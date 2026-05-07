"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertCircle, ArrowLeft, Zap, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { AnalysisSummary } from "@/components/AnalysisSummary";
import { ClauseCard } from "@/components/ClauseCard";
import { RiskClauseCard } from "@/components/RiskClauseCard";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { Button, LoadingSpinner, Alert } from "@/components/ui";
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
    <main className="min-h-screen px-6 py-8 md:px-10 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/30 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Upload Another Contract
          </Link>
        </motion.div>

        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex min-h-[60vh] flex-col items-center justify-center gap-6 rounded-2xl glass border border-slate-700/30 p-8"
            >
              <LoadingSpinner size="lg" text="Analyzing contract..." />
              <div className="text-center space-y-2">
                <p className="text-slate-300 font-medium">This may take a moment...</p>
                <p className="text-sm text-slate-400">
                  Our AI is carefully reviewing every clause
                </p>
              </div>
            </motion.section>
          )}

          {error && !isLoading && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Alert
                type="error"
                message={
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Analysis failed</p>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </div>
                }
              />

              <Button
                onClick={retry}
                icon={<RefreshCcw className="w-5 h-5" />}
                className="mt-4"
              >
                Retry Analysis
              </Button>
            </motion.section>
          )}

          {contract && analysis && !isLoading && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 py-8"
            >
              {/* Dashboard Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600/20 to-cyan-600/20">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Analysis Complete
                    </p>
                    <h1 className="text-4xl font-bold tracking-tight mt-1">
                      Contract Analysis
                    </h1>
                  </div>
                </div>
              </motion.div>

              {/* Risk Score and Summary Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]"
              >
                <RiskScoreCard score={analysis.risk_score} />
                <AnalysisSummary
                  summary={analysis.summary}
                  filename={contract.filename}
                />
              </motion.div>

              {/* Risk Clauses Section */}
              {analysis.risk_clauses && analysis.risk_clauses.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
                      <AlertCircle className="w-6 h-6 text-red-400" />
                      High-Risk Clauses
                    </h2>
                    <p className="text-slate-400 text-sm mb-6">
                      {analysis.risk_clauses.length} clauses that may be harmful or require
                      negotiation
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {analysis.risk_clauses.map((clause, i) => (
                      <motion.div
                        key={`risk-${clause.title}-${i}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                      >
                        <RiskClauseCard clause={clause} />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Important Clauses Section */}
              {analysis.important_clauses &&
                analysis.important_clauses.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.2 + (analysis.risk_clauses?.length || 0) * 0.05,
                    }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold mb-6">Important Clauses</h2>
                      <p className="text-slate-400 text-sm mb-6">
                        {analysis.important_clauses.length} key terms you should be aware
                        of
                      </p>
                    </div>

                    <div className="grid gap-4">
                      {analysis.important_clauses.map((clause, i) => (
                        <motion.div
                          key={`important-${clause.title}-${i}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay:
                              0.2 +
                              (analysis.risk_clauses?.length || 0) * 0.05 +
                              i * 0.05,
                          }}
                        >
                          <ClauseCard clause={clause} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}

              {/* Missing Clauses Section */}
              {analysis.missing_clauses && analysis.missing_clauses.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Missing Protections</h2>
                    <p className="text-slate-400 text-sm mb-6">
                      {analysis.missing_clauses.length} common clauses that are not
                      included
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {analysis.missing_clauses.map((clause, i) => (
                      <motion.div
                        key={`missing-${clause.title}-${i}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                      >
                        <ClauseCard clause={clause} />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Penalties Section */}
              {analysis.penalties && analysis.penalties.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-bold mb-6">Penalty Clauses</h2>
                    <p className="text-slate-400 text-sm mb-6">
                      {analysis.penalties.length} clauses defining penalties and
                      liabilities
                    </p>
                  </div>

                  <div className="grid gap-4">
                    {analysis.penalties.map((clause, i) => (
                      <motion.div
                        key={`penalty-${clause.title}-${i}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + i * 0.05 }}
                      >
                        <ClauseCard clause={clause} />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Unilateral Obligations Section */}
              {analysis.unilateral_obligations &&
                analysis.unilateral_obligations.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-2xl font-bold mb-6">Unilateral Obligations</h2>
                      <p className="text-slate-400 text-sm mb-6">
                        {analysis.unilateral_obligations.length} obligations that apply
                        only to one party
                      </p>
                    </div>

                    <div className="grid gap-4">
                      {analysis.unilateral_obligations.map((clause, i) => (
                        <motion.div
                          key={`unilateral-${clause.title}-${i}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + i * 0.05 }}
                        >
                          <ClauseCard clause={clause} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}

              {/* CTA Section */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-12 border border-blue-500/20 text-center space-y-6 mt-12"
              >
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Ready to analyze another contract?</h3>
                  <p className="text-slate-400">
                    Upload another PDF and get instant insights
                  </p>
                </div>
                <Link href="/upload">
                  <Button size="lg" icon={<Zap className="w-5 h-5" />}>
                    Upload Another Contract
                  </Button>
                </Link>
              </motion.section>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
