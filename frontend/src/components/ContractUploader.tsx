"use client";

import { ChangeEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Zap, AlertCircle, CheckCircle2 } from "lucide-react";

import { AnalysisSummary } from "@/components/AnalysisSummary";
import { ClauseCard } from "@/components/ClauseCard";
import { RiskClauseCard } from "@/components/RiskClauseCard";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { Button, Card, FileInput, Alert, LoadingSpinner } from "@/components/ui";
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

export function ContractUploader() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedContract, setUploadedContract] = useState<UploadContractResponse | null>(
    null
  );
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

  function handleReset() {
    setSelectedFile(null);
    setUploadedContract(null);
    setAnalysisResult(null);
    setError(null);
  }

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <Card className="p-8">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600/20 to-cyan-600/20">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold">Upload Contract</h2>
              </div>
              <p className="text-slate-400 text-sm">
                Select a PDF contract to analyze for risks and opportunities
              </p>
            </div>

            {/* File Input */}
            <FileInput
              onChange={handleFileChange}
              disabled={isLoading}
              fileName={selectedFile?.name}
            />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
                isLoading={isUploading}
                icon={<Zap className="w-5 h-5" />}
              >
                {isUploading ? "Uploading..." : "Upload Contract"}
              </Button>

              <Button
                onClick={handleAnalyze}
                disabled={!uploadedContract || isLoading}
                variant="secondary"
                isLoading={isAnalyzing}
                icon={<BarChart3 className="w-5 h-5" />}
              >
                {isAnalyzing ? "Analyzing..." : "Run Analysis"}
              </Button>

              {analysisResult && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                >
                  Analyze Another
                </Button>
              )}
            </div>

            {/* Status Messages */}
            <div className="space-y-2">
              <AnimatePresence>
                {error && (
                  <Alert
                    type="error"
                    message={error}
                    onClose={() => setError(null)}
                  />
                )}

                {uploadedContract && !analysisResult && (
                  <Alert
                    type="success"
                    message={
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Contract uploaded</p>
                          <p className="text-xs opacity-90 mt-1">
                            File: {uploadedContract.filename}
                          </p>
                        </div>
                      </div>
                    }
                  />
                )}

                {isAnalyzing && (
                  <Alert type="info" message={
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span>Analyzing contract with AI...</span>
                    </div>
                  } />
                )}
              </AnimatePresence>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Analysis Results */}
      <AnimatePresence mode="wait">
        {analysisResult && (
          <motion.section
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Risk Score Card */}
            <RiskScoreCard score={analysisResult.risk_score} />

            {/* Summary */}
            <AnalysisSummary
              summary={analysisResult.summary}
              filename={uploadedContract?.filename}
            />

            {/* Risk Clauses */}
            {analysisResult.risk_clauses && analysisResult.risk_clauses.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  High-Risk Clauses
                </h3>
                <div className="grid gap-4">
                  {analysisResult.risk_clauses.map((clause, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <RiskClauseCard clause={clause} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Clauses */}
            {analysisResult.important_clauses &&
              analysisResult.important_clauses.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-6">Important Clauses</h3>
                  <div className="grid gap-4">
                    {analysisResult.important_clauses.map((clause, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <ClauseCard clause={clause} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

            {/* Missing Clauses */}
            {analysisResult.missing_clauses && analysisResult.missing_clauses.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-6">Missing Protections</h3>
                <div className="grid gap-4">
                  {analysisResult.missing_clauses.map((clause, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ClauseCard clause={clause} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Penalties */}
            {analysisResult.penalties && analysisResult.penalties.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-6">Penalty Clauses</h3>
                <div className="grid gap-4">
                  {analysisResult.penalties.map((clause, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ClauseCard clause={clause} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Unilateral Obligations */}
            {analysisResult.unilateral_obligations &&
              analysisResult.unilateral_obligations.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-6">Unilateral Obligations</h3>
                  <div className="grid gap-4">
                    {analysisResult.unilateral_obligations.map((clause, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <ClauseCard clause={clause} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
