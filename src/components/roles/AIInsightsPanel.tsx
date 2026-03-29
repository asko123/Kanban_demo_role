"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Lightbulb, CheckCircle, ShieldAlert, ChevronDown, BrainCircuit, Zap } from "lucide-react";
import { Insight, getInsightsForRole } from "@/data/insights";
import { useBoardStore } from "@/store";

const CFG: Record<Insight["type"], { icon: typeof AlertTriangle; color: string; accent: string; bg: string; border: string }> = {
  risk:       { icon: ShieldAlert, color: "text-red-400", accent: "#EF4444", bg: "bg-red-500/8",   border: "border-red-500/20" },
  warning:    { icon: AlertTriangle, color: "text-amber-400", accent: "#F59E0B", bg: "bg-amber-500/8", border: "border-amber-500/20" },
  suggestion: { icon: Lightbulb, color: "text-cyan-400", accent: "#22D3EE", bg: "bg-cyan-500/8",  border: "border-cyan-500/20" },
  positive:   { icon: CheckCircle, color: "text-teal-400", accent: "#2DD4BF", bg: "bg-teal-500/8", border: "border-teal-500/20" },
};

export function AIInsightsPanel() {
  const role = useBoardStore((s) => s.role);
  const boardCards = useBoardStore((s) => s.cards);
  const currentDevId = useBoardStore((s) => s.currentDevId);
  const [expanded, setExpanded] = useState(true);
  const [active, setActive] = useState<string | null>(null);

  const insights = getInsightsForRole(role, boardCards, currentDevId);
  const alerts = insights.filter((i) => i.type === "risk" || i.type === "warning").length;

  return (
    <div className="relative rounded-2xl glow-border glow-border-slow overflow-hidden">
      {/* Gradient fill behind the animated border */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.04] via-transparent to-teal-500/[0.04] rounded-2xl" />

      <div className="relative backdrop-blur-2xl bg-white/[0.03] rounded-2xl overflow-hidden">
        {/* Animated top beam */}
        <div className="h-[2px] relative overflow-hidden">
          <motion.div className="absolute inset-y-0 w-1/2"
            style={{ background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.8), rgba(45,212,191,0.6), transparent)" }}
            animate={{ left: ["-50%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="p-4 space-y-3">
          {/* Header */}
          <button onClick={() => setExpanded(!expanded)} className="flex items-center justify-between w-full group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-teal-500/20 flex items-center justify-center border border-white/[0.1]">
                  <BrainCircuit className="w-4 h-4 text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
                </div>
                <motion.div className="absolute -inset-1 rounded-xl"
                  style={{ background: "conic-gradient(from 0deg, rgba(167,139,250,0.2), rgba(45,212,191,0.1), rgba(167,139,250,0.2))" }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
                <motion.div className="absolute -inset-0.5 rounded-xl border border-violet-400/20"
                  animate={{ opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div>
                <h3 className="text-xs font-black text-white tracking-[0.15em] text-glow-violet">
                  AI INSIGHTS
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Zap className="w-2.5 h-2.5 text-violet-400/50" />
                  <span className="text-[8px] text-violet-400/50 font-mono tracking-[0.2em]">NEURAL ENGINE v2</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {alerts > 0 && (
                <motion.span
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-[9px] px-2 py-1 rounded-lg bg-amber-500/15 text-amber-400 font-black border border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                >
                  {alerts} ALERT{alerts > 1 ? "S" : ""}
                </motion.span>
              )}
              <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4 text-white/30 group-hover:text-violet-400 transition-colors" />
              </motion.div>
            </div>
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="space-y-2.5">
                  {insights.map((ins, idx) => {
                    const c = CFG[ins.type];
                    const Icon = c.icon;
                    const open = active === ins.id;

                    return (
                      <motion.button key={ins.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        onClick={() => setActive(open ? null : ins.id)}
                        className={`w-full text-left p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 relative overflow-hidden ${c.bg} ${c.border} hover:brightness-125 ${open ? "shadow-[0_0_20px_rgba(0,0,0,0.2)]" : ""}`}
                      >
                        {/* Accent glow bar */}
                        <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full"
                          style={{ backgroundColor: c.accent, boxShadow: `0 0 8px ${c.accent}50` }} />

                        <div className="flex items-start gap-2.5 pl-2.5">
                          <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${c.color} drop-shadow-[0_0_6px_${c.accent}80]`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[11px] font-bold text-white">{ins.title}</p>
                              {ins.metric && (
                                <span className="text-[8px] px-2 py-0.5 rounded-lg bg-white/[0.06] text-white/50 font-mono border border-white/[0.06]">
                                  {ins.metric}
                                </span>
                              )}
                            </div>
                            <AnimatePresence>
                              {open && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                >
                                  <p className="text-[10px] text-white/50 mt-2 leading-relaxed border-t border-white/[0.06] pt-2">
                                    {ins.body}
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
                    <div className="text-center py-4">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-2">
                        <CheckCircle className="w-4 h-4 text-teal-400/30" />
                      </div>
                      <p className="text-[10px] text-white/20 font-mono tracking-widest">ALL SYSTEMS NOMINAL</p>
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
