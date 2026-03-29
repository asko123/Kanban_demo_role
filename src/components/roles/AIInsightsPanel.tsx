"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertTriangle, Lightbulb, CheckCircle, ShieldAlert, ChevronDown, BrainCircuit } from "lucide-react";
import { Insight, getInsightsForRole } from "@/data/insights";
import { useBoardStore } from "@/store";

const INSIGHT_CONFIG: Record<
  Insight["type"],
  { icon: typeof AlertTriangle; color: string; accent: string; bg: string; border: string; glow: string }
> = {
  risk: {
    icon: ShieldAlert,
    color: "text-red-400",
    accent: "#EF4444",
    bg: "bg-red-500/8",
    border: "border-red-500/20",
    glow: "shadow-[0_0_16px_rgba(239,68,68,0.1)]",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-400",
    accent: "#F59E0B",
    bg: "bg-amber-500/8",
    border: "border-amber-500/20",
    glow: "shadow-[0_0_16px_rgba(245,158,11,0.1)]",
  },
  suggestion: {
    icon: Lightbulb,
    color: "text-cyan-400",
    accent: "#22D3EE",
    bg: "bg-cyan-500/8",
    border: "border-cyan-500/20",
    glow: "shadow-[0_0_16px_rgba(34,211,238,0.1)]",
  },
  positive: {
    icon: CheckCircle,
    color: "text-teal-400",
    accent: "#2DD4BF",
    bg: "bg-teal-500/8",
    border: "border-teal-500/20",
    glow: "shadow-[0_0_16px_rgba(45,212,191,0.1)]",
  },
};

export function AIInsightsPanel() {
  const role = useBoardStore((s) => s.role);
  const boardCards = useBoardStore((s) => s.cards);
  const currentDevId = useBoardStore((s) => s.currentDevId);
  const [expanded, setExpanded] = useState(true);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const insights = getInsightsForRole(role, boardCards, currentDevId);
  const riskCount = insights.filter((i) => i.type === "risk" || i.type === "warning").length;

  return (
    <div className="relative">
      {/* Outer glow container */}
      <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-br from-violet-500/20 via-teal-500/10 to-cyan-500/20 opacity-60 blur-[1px]" />

      <div className="relative rounded-xl bg-white/[0.04] border border-white/[0.1] backdrop-blur-2xl overflow-hidden">
        {/* Animated top accent bar */}
        <div className="h-[2px] relative overflow-hidden">
          <motion.div
            className="absolute inset-y-0 w-2/3"
            style={{ background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.6), rgba(45,212,191,0.4), transparent)" }}
            animate={{ left: ["-66%", "100%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="p-3 space-y-2.5">
          {/* Header */}
          <button onClick={() => setExpanded(!expanded)} className="flex items-center justify-between w-full group">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <BrainCircuit className="w-4 h-4 text-violet-400 drop-shadow-[0_0_6px_rgba(167,139,250,0.5)]" />
                <motion.div
                  className="absolute -inset-1.5 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(167,139,250,0.15), transparent)" }}
                  animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
              <div>
                <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.15em] neon-text-violet">
                  AI Insights
                </h3>
                <p className="text-[8px] text-violet-400/50 font-mono tracking-wider">NEURAL ANALYSIS</p>
              </div>
              {riskCount > 0 && (
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-[9px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-bold border border-amber-500/20 shadow-[0_0_8px_rgba(245,158,11,0.15)]"
                >
                  {riskCount} ALERT{riskCount > 1 ? "S" : ""}
                </motion.span>
              )}
            </div>
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-400 transition-colors" />
            </motion.div>
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="overflow-hidden"
              >
                <div className="space-y-2">
                  {insights.map((insight, idx) => {
                    const config = INSIGHT_CONFIG[insight.type];
                    const Icon = config.icon;
                    const isExp = expandedInsight === insight.id;

                    return (
                      <motion.button
                        key={insight.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.08, duration: 0.3 }}
                        onClick={() => setExpandedInsight(isExp ? null : insight.id)}
                        className={`
                          w-full text-left p-2.5 rounded-lg border backdrop-blur-sm
                          transition-all duration-300 relative overflow-hidden
                          ${config.bg} ${config.border} ${config.glow}
                          hover:brightness-125
                        `}
                      >
                        {/* Left accent bar */}
                        <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full"
                          style={{ backgroundColor: config.accent, boxShadow: `0 0 6px ${config.accent}40` }} />

                        <div className="flex items-start gap-2 pl-2">
                          <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${config.color} drop-shadow-[0_0_4px_${config.accent}80]`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[11px] font-semibold text-white/90">{insight.title}</p>
                              {insight.metric && (
                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-300 font-mono shrink-0 border border-white/[0.06]">
                                  {insight.metric}
                                </span>
                              )}
                            </div>
                            <AnimatePresence>
                              {isExp && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed border-t border-white/[0.06] pt-2">
                                    {insight.body}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}

                  {insights.length === 0 && (
                    <div className="text-center py-3">
                      <Sparkles className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                      <p className="text-[10px] text-slate-600 font-mono">NO ANOMALIES DETECTED</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
