import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { ReactNode } from "react";

interface AlertProps {
  type: "success" | "error" | "info" | "warning";
  message: string | ReactNode;
  onClose?: () => void;
  icon?: ReactNode;
}

export function Alert({ type, message, onClose, icon }: AlertProps) {
  const styles = {
    success: {
      bg: "bg-green-500/10 border border-green-500/30",
      text: "text-green-300",
      icon: <CheckCircle2 className="w-5 h-5" />,
    },
    error: {
      bg: "bg-red-500/10 border border-red-500/30",
      text: "text-red-300",
      icon: <AlertCircle className="w-5 h-5" />,
    },
    info: {
      bg: "bg-blue-500/10 border border-blue-500/30",
      text: "text-blue-300",
      icon: <Info className="w-5 h-5" />,
    },
    warning: {
      bg: "bg-yellow-500/10 border border-yellow-500/30",
      text: "text-yellow-300",
      icon: <AlertCircle className="w-5 h-5" />,
    },
  };

  const style = styles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${style.bg} rounded-lg p-4 flex items-start gap-3 ${style.text}`}
    >
      {icon || style.icon}
      <div className="flex-1 text-sm">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-700/50 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
