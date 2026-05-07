"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, Menu, X } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 glass border-b border-slate-700/50"
    >
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600"
            >
              <Brain className="w-6 h-6 text-white" />
            </motion.div>
            <div className="hidden sm:flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ContractGuard
              </span>
              <span className="text-xs text-slate-500 font-medium">AI Legal Analysis</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/upload"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Upload
            </Link>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/upload"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
            >
              Start Analysis
            </motion.a>
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-700/40 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-4 pt-4 border-t border-slate-700/50 space-y-3"
          >
            <Link
              href="/"
              className="block text-sm font-medium text-slate-300 hover:text-white transition-colors py-2"
            >
              Home
            </Link>
            <Link
              href="/upload"
              className="block text-sm font-medium text-slate-300 hover:text-white transition-colors py-2"
            >
              Upload
            </Link>
            <Link
              href="/upload"
              className="block px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold text-center"
            >
              Start Analysis
            </Link>
          </motion.nav>
        )}
      </div>
    </motion.header>
  );
}
