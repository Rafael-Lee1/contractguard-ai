import { FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function AnalysisSummary({
  summary,
  filename,
}: {
  summary: string;
  filename?: string;
}) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="glass rounded-2xl p-8 border border-cyan-500/20 overflow-hidden group hover:border-cyan-500/40 transition-all hover:shadow-2xl hover:shadow-cyan-500/10"
    >
      {/* Background gradient */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-600/10 to-blue-600/10 blur-3xl -z-10" />

      <motion.div variants={item} className="flex items-start gap-3 mb-6">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 10 }}
          className="p-3 rounded-lg bg-gradient-to-br from-cyan-600/20 to-blue-600/20"
        >
          <Sparkles className="w-6 h-6 text-cyan-400" />
        </motion.div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            AI Analysis
          </p>
          <h2 className="text-2xl font-bold">Executive Summary</h2>
        </div>
      </motion.div>

      {filename && (
        <motion.div
          variants={item}
          className="mb-6 flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-700/40 bg-slate-800/20 hover:bg-slate-800/40 transition-colors"
        >
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="truncate text-sm text-slate-300 font-medium">{filename}</span>
        </motion.div>
      )}

      <motion.div
        variants={item}
        className="prose prose-invert max-w-none"
      >
        <p className="text-base leading-8 text-slate-200 whitespace-pre-wrap">
          {summary || "No summary available for this contract."}
        </p>
      </motion.div>

      {/* Bottom accent */}
      <div className="mt-6 h-px bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-transparent" />
    </motion.section>
  );
}
