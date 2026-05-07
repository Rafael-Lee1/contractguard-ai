import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variantStyles = {
    default: "bg-blue-500/20 text-blue-300 border border-blue-400/30",
    success: "bg-green-500/20 text-green-300 border border-green-400/30",
    warning: "bg-yellow-500/20 text-yellow-300 border border-yellow-400/30",
    danger: "bg-red-500/20 text-red-300 border border-red-400/30",
    info: "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
