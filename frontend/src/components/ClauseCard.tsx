import { AlertCircle, CheckCircle2, Lightbulb, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

import type { MissingClauseInsight, Severity } from "@/lib/api";

function getSeverityStyles(severity: Severity) {
  switch (severity) {
    case "critical":
    case "high":
      return {
        badge: "bg-red-500/20 border border-red-500/30 text-red-300",
        icon: "bg-red-500/20 text-red-400",
        Icon: ShieldAlert,
        accent: "text-red-400",
      };
    case "medium":
      return {
        badge: "bg-yellow-500/20 border border-yellow-500/30 text-yellow-300",
        icon: "bg-yellow-500/20 text-yellow-400",
        Icon: AlertCircle,
        accent: "text-yellow-400",
      };
    default:
      return {
        badge: "bg-green-500/20 border border-green-500/30 text-green-300",
        icon: "bg-green-500/20 text-green-400",
        Icon: CheckCircle2,
        accent: "text-green-400",
      };
  }
}

export function ClauseCard({ clause }: { clause: MissingClauseInsight }) {
  const severity = getSeverityStyles(clause.severity);
  const SeverityIcon = severity.Icon;

  return (
    <motion.article
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -4 }}
      className="glass rounded-2xl p-6 border border-slate-700/30 hover:border-slate-600/50 transition-all group"
    >
      <div className="flex items-start gap-4">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className={`rounded-lg p-2.5 ${severity.icon} flex-shrink-0`}
        >
          <SeverityIcon className="w-5 h-5" />
        </motion.div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <h3 className="text-lg font-semibold text-slate-100 leading-snug">
              {clause.title}
            </h3>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${severity.badge} flex-shrink-0`}
            >
              {clause.severity}
            </motion.span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 h-px bg-gradient-to-r from-slate-700/50 to-transparent" />

      <div className="space-y-4">
        {/* Explanation */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            📋 Explanation
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">{clause.explanation}</p>
        </div>

        {/* Recommendation */}
        <motion.div
          whileHover={{ borderColor: "rgb(59, 130, 246)" }}
          className="rounded-xl bg-slate-800/40 border border-slate-700/30 p-4 transition-colors"
        >
          <div className="flex items-start gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
              💡 Recommendation
            </p>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {clause.recommendation}
          </p>
        </motion.div>
      </div>
    </motion.article>
  );
}
