import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { ChangeEvent } from "react";

interface FileInputProps {
  accept?: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  fileName?: string;
}

export function FileInput({ accept = ".pdf", onChange, disabled, fileName }: FileInputProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative group"
    >
      <input
        type="file"
        accept={accept}
        onChange={onChange}
        disabled={disabled}
        className="hidden"
        id="file-input"
      />
      <label
        htmlFor="file-input"
        className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl border-2 border-dashed border-slate-600/50 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group hover:bg-slate-800/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="p-4 rounded-lg bg-gradient-to-br from-blue-600/20 to-cyan-600/20 group-hover:from-blue-600/40 group-hover:to-cyan-600/40 transition-all"
        >
          <Upload className="w-8 h-8 text-blue-400" />
        </motion.div>
        <div className="text-center">
          <p className="text-base font-semibold text-slate-100">
            {fileName ? `Selected: ${fileName}` : "Drop your contract here"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            or click to browse (PDF only)
          </p>
        </div>
      </label>
    </motion.div>
  );
}
