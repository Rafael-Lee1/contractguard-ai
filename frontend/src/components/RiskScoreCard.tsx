import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ShieldAlert, TrendingUp } from "lucide-react";

function getRiskTone(score: number) {
  if (score >= 70) {
    return {
      label: "High Risk",
      description: "Immediate legal review recommended before signing.",
      textColor: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      gradientFrom: "#ef4444",
      gradientTo: "#dc2626",
      icon: ShieldAlert,
    };
  }

  if (score >= 40) {
    return {
      label: "Medium Risk",
      description: "Review key terms and missing protections before approval.",
      textColor: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      gradientFrom: "#eab308",
      gradientTo: "#ca8a04",
      icon: AlertTriangle,
    };
  }

  return {
    label: "Low Risk",
    description: "No major structural risk signals were detected.",
    textColor: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    gradientFrom: "#22c55e",
    gradientTo: "#16a34a",
    icon: CheckCircle2,
  };
}

export function RiskScoreCard({ score }: { score: number }) {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  const tone = getRiskTone(normalizedScore);
  const Icon = tone.icon;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

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
      className={`glass rounded-2xl p-8 border ${tone.borderColor} overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/10 transition-all`}
    >
      <div className="grid md:grid-cols-[180px_1fr] gap-8 items-center">
        {/* Radial Chart */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center"
        >
          <div className="relative w-40 h-40">
            {/* Background circle */}
            <svg
              className="absolute inset-0 transform -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <motion.circle
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={`url(#gradient)`}
                strokeWidth="8"
                strokeLinecap="round"
                style={{
                  strokeDasharray: circumference,
                }}
              />
              <defs>
                <linearGradient
                  id="gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={tone.gradientFrom} />
                  <stop offset="100%" stopColor={tone.gradientTo} />
                </linearGradient>
              </defs>
            </svg>

            {/* Center content */}
            <motion.div
              variants={item}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div className="text-4xl font-bold">{normalizedScore}</div>
              <div className="text-xs text-slate-400 font-medium">of 100</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div variants={container} className="space-y-6">
          {/* Title and Badge */}
          <motion.div variants={item}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Risk Analysis
                </p>
                <h3 className="text-2xl font-bold">Contract Exposure</h3>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${tone.bgColor} border ${tone.borderColor}`}
              >
                <Icon className={`w-4 h-4 ${tone.textColor}`} />
                <span className={`text-sm font-semibold ${tone.textColor}`}>
                  {tone.label}
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Risk description */}
          <motion.p
            variants={item}
            className="text-slate-300 leading-relaxed text-sm"
          >
            {tone.description}
          </motion.p>

          {/* Risk breakdown */}
          <motion.div
            variants={item}
            className="space-y-3 pt-4 border-t border-slate-700/50"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Risk Level</span>
              <div className="flex gap-2">
                {["Low", "Medium", "High"].map((level, i) => (
                  <motion.div
                    key={level}
                    className={`h-1.5 w-3 rounded-full transition-all ${
                      (level === "Low" && normalizedScore < 40) ||
                      (level === "Medium" &&
                        normalizedScore >= 40 &&
                        normalizedScore < 70) ||
                      (level === "High" && normalizedScore >= 70)
                        ? `${tone.bgColor} ${tone.borderColor} border`
                        : "bg-slate-700/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Action button */}
          <motion.div
            variants={item}
            className="flex items-center gap-2 pt-2 text-blue-400 text-sm font-medium hover:gap-3 transition-all cursor-pointer group/link"
          >
            <TrendingUp className="w-4 h-4" />
            <span>View detailed breakdown</span>
            <motion.span
              animate={{ x: 0 }}
              whileHover={{ x: 4 }}
              className="text-blue-400"
            >
              →
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}
