"use client";

import { ChangeEvent, useState } from "react";
import { AlertCircle, BarChart3, CheckCircle2, FileUp, Layers3, UploadCloud } from "lucide-react";

import { AnalysisSummary } from "@/components/AnalysisSummary";
import { ClauseCard } from "@/components/ClauseCard";
import { RiskClauseCard } from "@/components/RiskClauseCard";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import {
  analyzeContract,
  type AnalysisResponse,
  type ApiError,
  type UploadContractResponse,
  uploadContract,
} from "@/lib/api";

function isPdfFile(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

function LoadingSpinner() {
  return (
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
  );
}

export function ContractUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedContract, setUploadedContract] = useState<UploadContractResponse | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = isUploading || isAnalyzing;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    setError(null);
    setAnalysisResult(null);
    setUploadedContract(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!isPdfFile(file)) {
      setSelectedFile(null);
      setError("Please select a PDF contract.");
      return;
    }

    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError("Choose a PDF contract before uploading.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await uploadContract(selectedFile);
      setUploadedContract(response);
    } catch (uploadError) {
      const apiError = uploadError as ApiError;
      setError(apiError.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleAnalyze() {
    if (!uploadedContract?.id) {
      setError("Upload a contract before running analysis.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await analyzeContract(uploadedContract.id);
      setAnalysisResult(response);
    } catch (analysisError) {
      const apiError = analysisError as ApiError;
      setError(apiError.message || "Analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="animate-fade-in overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-950 p-2.5 text-white">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Upload
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                Start a contract review
              </h2>
            </div>
          </div>
        </div>

        <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <label htmlFor="contract-file" className="block text-sm font-medium text-slate-700">
              Contract PDF
            </label>
            <input
              id="contract-file"
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              disabled={isLoading}
              className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
            />
            <div className="mt-3 min-h-5 text-sm text-slate-500">
              {selectedFile ? `Selected: ${selectedFile.name}` : "Upload one PDF contract at a time."}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void handleUpload()}
              disabled={!selectedFile || isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isUploading ? <LoadingSpinner /> : null}
              {!isUploading ? <FileUp className="h-4 w-4" /> : null}
              {isUploading ? "Uploading..." : "Upload Contract"}
            </button>

            <button
              type="button"
              onClick={() => void handleAnalyze()}
              disabled={!uploadedContract || isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isAnalyzing ? <LoadingSpinner /> : null}
              {!isAnalyzing ? <BarChart3 className="h-4 w-4" /> : null}
              {isAnalyzing ? "Analyzing..." : "Analyze Contract"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        {uploadedContract ? (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Uploaded contract ID: <span className="font-mono">{uploadedContract.id}</span>
            </span>
          </div>
        ) : null}
        </div>
      </section>

      {isAnalyzing ? (
        <section className="animate-fade-in flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm font-medium text-slate-600 shadow-sm shadow-slate-200/70">
          <LoadingSpinner />
          Preparing contract analysis dashboard...
        </section>
      ) : null}

      {analysisResult ? (
        <section className="animate-fade-in-up space-y-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                <Layers3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Dashboard
                </p>
                <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                  Contract Analysis
                </h2>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <RiskScoreCard score={analysisResult.risk_score} />
            <AnalysisSummary
              summary={analysisResult.summary}
              filename={uploadedContract?.filename}
            />
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
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                  Clauses that may be harmful or abusive
                </h3>
              </div>
              <span className="text-sm text-red-700">
                {analysisResult.risk_clauses.length} found
              </span>
            </div>

            {analysisResult.risk_clauses.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {analysisResult.risk_clauses.map((clause) => (
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
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                  Gaps requiring attention
                </h3>
              </div>
              <span className="text-sm text-slate-500">
                {analysisResult.missing_clauses.length} found
              </span>
            </div>

            {analysisResult.missing_clauses.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {analysisResult.missing_clauses.map((clause) => (
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
  );
}
