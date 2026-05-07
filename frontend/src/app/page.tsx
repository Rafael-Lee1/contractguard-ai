"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  Shield,
  Brain,
  Sparkles,
  ArrowRight,
  BarChart3,
  FileText,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui";

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
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
  },
};

const features = [
  {
    icon: Shield,
    title: "Risk Detection",
    description: "AI-powered detection of unfavorable clauses and hidden risks",
  },
  {
    icon: Brain,
    title: "Smart Analysis",
    description: "Advanced machine learning models trained on legal contracts",
  },
  {
    icon: BarChart3,
    title: "Risk Scoring",
    description: "Comprehensive risk metrics and detailed exposure analysis",
  },
  {
    icon: Lock,
    title: "Enterprise Secure",
    description: "Your documents are encrypted and never stored permanently",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 py-20 sm:py-32 overflow-hidden">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 border border-blue-500/30 px-4 py-2 mb-6"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">
                Powered by Advanced AI
              </span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="block">Contract Analysis</span>
              <span className="block gradient-text">Reimagined</span>
            </h1>

            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              Upload any PDF contract and let our AI uncover hidden risks, unfavorable
              clauses, and critical insights in seconds. Enterprise-grade legal tech at
              your fingertips.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link href="/upload">
                <Button size="lg" className="group">
                  <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Start Free Analysis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <motion.a
                href="#features"
                whileHover={{ y: -2 }}
                className="px-7 py-4 rounded-lg border border-slate-600/40 text-slate-300 font-semibold hover:bg-slate-700/40 transition-all"
              >
                Learn More
              </motion.a>
            </motion.div>

            {/* Hero Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-slate-800/40 border border-slate-700/50"
            >
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border border-slate-800"
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Trusted by legal teams
              </span>
            </motion.div>
          </motion.div>

          {/* Floating Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-2xl opacity-20" />
            <div className="relative glass rounded-3xl p-8 border border-blue-500/20">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">95%</div>
                  <p className="text-sm text-slate-400">Risk Detection Accuracy</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">&lt;30s</div>
                  <p className="text-sm text-slate-400">Average Analysis Time</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text mb-2">Enterprise</div>
                  <p className="text-sm text-slate-400">Grade Security</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Powerful Capabilities
            </h2>
            <p className="text-slate-400 text-lg">
              Everything you need to analyze contracts with confidence
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={i}
                  variants={item}
                  whileHover={{ y: -8 }}
                  className="group glass rounded-2xl p-8 border border-slate-700/30 hover:border-blue-500/30 transition-all"
                >
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600/20 to-cyan-600/20 w-fit mb-4 group-hover:from-blue-600/40 group-hover:to-cyan-600/40 transition-all">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 sm:p-16 border border-blue-500/20 text-center"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Ready to analyze your contracts?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Upload a PDF and get detailed risk analysis, clause insights, and
              recommendations in seconds.
            </p>
            <Link href="/upload">
              <Button size="lg" className="mx-auto">
                <Zap className="w-5 h-5" />
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
