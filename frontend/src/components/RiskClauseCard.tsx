import { AlertTriangle, Lightbulb, ShieldAlert, Zap } from "lucide-react";
import { motion } from "framer-motion";

import type { ClauseInsight } from "@/lib/api";

function getSeverityStyles(severity: ClauseInsight["severity"]) {
  if (severity === "critical") {
    return {
      badge: "bg-red-500/20 border border-red-500/30 text-red-300",
      icon: "bg-red-500/20 text-red-400",
      Icon: ShieldAlert,
      accent: "text-red-400",
      bgAccent: "bg-red-500/10",
    };
  }

  return {
    badge: "bg-orange-500/20 border border-orange-500/30 text-orange-300",
    icon: "bg-orange-500/20 text-orange-400",
    Icon: AlertTriangle,
    accent: "text-orange-400",
    bgAccent: "bg-orange-500/10",
  };
}

export function RiskClauseCard({ clause }: { clause: ClauseInsight }) {
  const severity = getSeverityStyles(clause.severity);
  const SeverityIcon = severity.Icon;

  return (
    <motion.article
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -4 }}
      className="glass rounded-2xl p-6 border border-red-500/20 hover:border-red-500/40 transition-all group relative"
    >
      <div className="flex items-start gap-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
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
      <div className="my-4 h-px bg-gradient-to-r from-red-500/30 to-transparent" />

      <div className="space-y-4">
        {/* Explanation */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            📋 Overview
          </p>
          <p className="text-sm text-slate-300 leading-relaxed">{clause.explanation}</p>
        </div>

        {/* Why it's dangerous */}
        <motion.div
          whileHover={{ borderColor: "rgb(239, 68, 68)" }}
          className={`rounded-xl ${severity.bgAccent} border border-red-500/20 p-4 transition-colors`}
        >
          <div className="flex items-start gap-2 mb-2">
            <Zap className={`w-4 h-4 ${severity.accent} flex-shrink-0 mt-0.5`} />
            <p className={`text-xs font-semibold uppercase tracking-wider ${severity.accent}`}>
              ⚠️ Why this is dangerous
            </p>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {clause.risk_reason || clause.explanation}
          </p>
        </motion.div>

        {/* Recommendation */}
        <motion.div
          whileHover={{ borderColor: "rgb(59, 130, 246)" }}
          className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 transition-colors"
        >
          <div className="flex items-start gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">
              💡 Recommendation
            </p>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{clause.recommendation}</p>
        </motion.div>
      </div>

      {/* Accent bar */}
      <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl bg-gradient-to-b from-red-500 to-orange-500" />
    </motion.article>
  );
}
