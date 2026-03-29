"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, AlertTriangle, Lightbulb, CheckCircle, ShieldAlert, ChevronDown } from "lucide-react";
import { Insight, getInsightsForRole } from "@/data/insights";
import { useBoardStore } from "@/store";

const INSIGHT_CONFIG: Record<
  Insight["type"],
  { icon: typeof AlertTriangle; color: string; bg: string; border: string; glow: string }
> = {
  risk: {
    icon: ShieldAlert,
    color: "text-red-400",
    bg: "bg-red-500/5",
    border: "border-red-500/15",
    glow: "shadow-[0_0_12px_rgba(239,68,68,0.06)]",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/5",
    border: "border-amber-500/15",
    glow: "shadow-[0_0_12px_rgba(245,158,11,0.06)]",
  },
  suggestion: {
    icon: Lightbulb,
    color: "text-blue-400",
    bg: "bg-blue-500/5",
    border: "border-blue-500/15",
    glow: "shadow-[0_0_12px_rgba(59,130,246,0.06)]",
  },
  positive: {
    icon: CheckCircle,
    color: "text-teal-400",
    bg: "bg-teal-500/5",
    border: "border-teal-500/15",
    glow: "shadow-[0_0_12px_rgba(45,212,191,0.06)]",
  },
};

export function AIInsightsPanel() {
  const role = useBoardStore((s) => s.role);
  const boardCards = useBoardStore((s) => s.cards);
  const [expanded, setExpanded] = useState(true);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const insights = getInsightsForRole(role, boardCards);

  const riskCount = insights.filter((i) => i.type === "risk" || i.type === "warning").length;

  return (
    <div className="space-y-2">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full group"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <motion.div
              className="absolute -inset-1 rounded-full bg-violet-500/20"
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <h3 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
            AI Insights
          </h3>
          {riskCount > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold">
              {riskCount}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-1">
              {insights.map((insight, idx) => {
                const config = INSIGHT_CONFIG[insight.type];
                const Icon = config.icon;
                const isExpanded = expandedInsight === insight.id;

                return (
                  <motion.button
                    key={insight.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06, duration: 0.25 }}
                    onClick={() =>
                      setExpandedInsight(isExpanded ? null : insight.id)
                    }
                    className={`
                      w-full text-left p-2.5 rounded-lg border backdrop-blur-sm
                      transition-all duration-200
                      ${config.bg} ${config.border} ${config.glow}
                      hover:brightness-110
                    `}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${config.color}`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-medium text-slate-200">
                            {insight.title}
                          </p>
                          {insight.metric && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-400 font-mono shrink-0">
                              {insight.metric}
                            </span>
                          )}
                        </div>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.p
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-[10px] text-slate-400 mt-1.5 leading-relaxed"
                            >
                              {insight.body}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.button>
                );
              })}

              {insights.length === 0 && (
                <p className="text-[11px] text-slate-500 italic text-center py-2">
                  No insights to show right now
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
