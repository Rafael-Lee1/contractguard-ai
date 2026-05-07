import { ReactNode } from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  delay?: number;
}

export function Card({
  children,
  className = "",
  hover = true,
  gradient = false,
  delay = 0,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -4 } : {}}
      className={`glass rounded-2xl p-6 ${
        hover
          ? "transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20"
          : ""
      } ${
        gradient
          ? "bg-gradient-to-br from-slate-800/40 to-slate-900/40"
          : "bg-slate-800/30"
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
