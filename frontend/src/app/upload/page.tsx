"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, Zap } from "lucide-react";

import { ContractUploader } from "@/components/ContractUploader";

export default function UploadPage() {
  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/30 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/30 px-4 py-2 mb-6">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">
              Upload & Analyze
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">
            Contract Analysis Workspace
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
            Upload your PDF contract and our AI will instantly detect risks, unfavorable
            clauses, and provide actionable recommendations. Get comprehensive insights in
            seconds.
          </p>
        </motion.div>

        {/* Uploader */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ContractUploader />
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 gap-6 mt-12"
        >
          <div className="glass rounded-2xl p-6 border border-slate-700/30">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">What We Analyze</h3>
                <p className="text-sm text-slate-400">
                  Risk clauses, missing protections, penalties, unilateral obligations,
                  and more.
                </p>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-slate-700/30">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-cyan-600/20 text-cyan-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">How It Works</h3>
                <p className="text-sm text-slate-400">
                  Upload → AI Analysis → Risk Score → Detailed Insights → Ready to
                  review.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
