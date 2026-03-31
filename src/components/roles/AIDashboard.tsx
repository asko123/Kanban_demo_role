"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit, Crosshair, ShieldAlert, AlertTriangle, Info,
  TrendingUp, TrendingDown, Minus, Sparkles, Target, Users,
  Rocket, Lightbulb, Flag,
} from "lucide-react";
import { useBoardStore } from "@/store";
import { generateDashboard, AINarrative, AIRisk } from "@/data/ai-dashboard";

const CAT: Record<string, { icon: typeof Crosshair; color: string; accent: string }> = {
  focus:          { icon: Crosshair,  color: "text-cyan-400",   accent: "#22D3EE" },
  blocker:        { icon: ShieldAlert, color: "text-red-400",    accent: "#EF4444" },
  opportunity:    { icon: Lightbulb,  color: "text-amber-400",  accent: "#F59E0B" },
  momentum:       { icon: Rocket,     color: "text-teal-400",   accent: "#2DD4BF" },
  collaboration:  { icon: Users,      color: "text-blue-400",   accent: "#3B82F6" },
  recommendation: { icon: Target,     color: "text-violet-400", accent: "#A78BFA" },
};
const RSK: Record<string, { icon: typeof ShieldAlert; color: string; accent: string }> = {
  critical: { icon: ShieldAlert, color: "text-red-400", accent: "#EF4444" },
  warning: { icon: AlertTriangle, color: "text-amber-400", accent: "#F59E0B" },
  info: { icon: Info, color: "text-cyan-400", accent: "#22D3EE" },
};
const TRD = { up: TrendingUp, down: TrendingDown, stable: Minus };

function NCard({ n, idx }: { n: AINarrative; idx: number }) {
  const c = CAT[n.category] ?? CAT.focus;
  const Icon = c.icon;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + idx * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden hover:border-white/[0.15] transition-all duration-300">
      <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full" style={{ backgroundColor: c.accent, boxShadow: `0 0 10px ${c.accent}40` }} />
      <div className="p-3.5 pl-5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className={`w-3.5 h-3.5 shrink-0 ${c.color}`} style={{ filter: `drop-shadow(0 0 4px ${c.accent}60)` }} />
            <h4 className="text-[12px] font-bold text-white truncate">{n.headline}</h4>
          </div>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/25 font-mono border border-white/[0.04] shrink-0">{n.aiConfidence}%</span>
        </div>
        <p className="text-[10.5px] text-white/50 leading-[1.6]">{n.narrative}</p>
        {n.details && n.details.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-white/[0.04]">
            {n.details.map((d, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: d.color ?? c.accent, boxShadow: `0 0 4px ${d.color ?? c.accent}60` }} />
                  <span className="text-[10px] text-white/60 truncate">{d.label}</span>
                </div>
                <span className="text-[9px] text-white/35 font-mono shrink-0">{d.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function RCard({ r, idx }: { r: AIRisk; idx: number }) {
  const c = RSK[r.severity] ?? RSK.info;
  const Icon = c.icon;
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + idx * 0.06, duration: 0.3 }}
      className="p-2.5 rounded-lg border bg-white/[0.02] flex items-start gap-2.5" style={{ borderColor: `${c.accent}25` }}>
      <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${c.color}`} style={{ filter: `drop-shadow(0 0 4px ${c.accent}60)` }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-bold text-white/80 truncate">{r.title}</p>
          <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.04] font-mono shrink-0" style={{ color: `${c.accent}99` }}>{r.metric}</span>
        </div>
        <p className="text-[9px] text-white/35 mt-0.5 leading-relaxed">{r.description}</p>
      </div>
    </motion.div>
  );
}

export function AIDashboard() {
  const boardCards = useBoardStore((s) => s.cards);
  const currentDevId = useBoardStore((s) => s.currentDevId);
  const db = useMemo(() => generateDashboard(currentDevId, boardCards), [currentDevId, boardCards]);
  const ic = db.topAction.impact === "critical" ? "#EF4444" : db.topAction.impact === "high" ? "#F59E0B" : db.topAction.impact === "medium" ? "#22D3EE" : "#64748B";
  const rc = db.riskAssessment.label === "Elevated" ? "#EF4444" : db.riskAssessment.label === "Moderate" ? "#F59E0B" : "#2DD4BF";

  return (
    <div className="space-y-4">
      {/* AI HEADER */}
      <div className="relative rounded-2xl glow-border glow-border-slow overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] via-transparent to-teal-500/[0.03]" />
        <div className="relative backdrop-blur-2xl bg-white/[0.02] p-4 rounded-2xl">
          <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden rounded-t-2xl">
            <motion.div className="absolute inset-y-0 w-1/2" style={{ background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.8), rgba(45,212,191,0.5), transparent)" }}
              animate={{ left: ["-50%", "100%"] }} transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }} />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/25 to-teal-500/25 flex items-center justify-center border border-white/[0.1]">
                <BrainCircuit className="w-5 h-5 text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
              </div>
              <motion.div className="absolute -inset-1 rounded-xl" style={{ background: "conic-gradient(from 0deg, rgba(167,139,250,0.15), rgba(45,212,191,0.08), rgba(167,139,250,0.15))" }}
                animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
            </div>
            <div>
              <h3 className="text-[11px] font-black text-white tracking-[0.12em] text-glow-violet">AI BRIEFING</h3>
              <p className="text-[8px] text-violet-400/50 font-mono tracking-[0.2em]">NEXUS INTELLIGENCE</p>
            </div>
          </div>
          <p className="text-[11px] text-white/60 leading-relaxed">{db.greeting}</p>
          <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5"><Flag className="w-3 h-3 text-teal-400/50" /><span className="text-[9px] text-white/30 font-mono">{db.sprintContext.name}</span></div>
            <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-teal-500/40 to-cyan-500/40" style={{ width: `${db.sprintContext.progress}%` }} /></div>
            <span className="text-[9px] text-white/30 font-mono">{db.sprintContext.progress}%</span>
            <span className="text-[8px] text-white/20 font-mono">{db.sprintContext.daysLeft}d left</span>
          </div>
        </div>
      </div>

      {/* TOP ACTION */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
        className="relative rounded-xl border overflow-hidden" style={{ borderColor: `${ic}30`, boxShadow: `0 0 20px ${ic}10` }}>
        <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: ic, boxShadow: `0 0 8px ${ic}50` }} />
        <div className="p-3.5 pl-5 bg-white/[0.02]">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-3.5 h-3.5" style={{ color: ic, filter: `drop-shadow(0 0 4px ${ic}80)` }} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: `${ic}CC` }}>TOP ACTION · {db.topAction.impact}</span>
          </div>
          <p className="text-[12px] font-bold text-white leading-snug">{db.topAction.action}</p>
          <p className="text-[10px] text-white/40 mt-1.5 leading-relaxed">{db.topAction.reason}</p>
        </div>
      </motion.div>

      {/* RISKS */}
      {db.riskAssessment.risks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5" style={{ color: rc }} /><span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Risk Assessment</span></div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-1.5 rounded-full bg-white/[0.06] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${db.riskAssessment.score}%`, backgroundColor: rc }} /></div>
              <span className="text-[9px] font-mono font-bold" style={{ color: rc }}>{db.riskAssessment.label}</span>
            </div>
          </div>
          <div className="space-y-1.5">{db.riskAssessment.risks.map((r, i) => <RCard key={i} r={r} idx={i} />)}</div>
        </motion.div>
      )}

      {/* PATTERNS */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }} className="grid grid-cols-2 gap-2">
        {db.patterns.map((p, i) => {
          const TI = TRD[p.trend];
          const tc = p.trend === "up" ? (p.label === "WIP Load" || p.label === "Cycle Time" ? "#F59E0B" : "#2DD4BF") : p.trend === "down" ? "#EF4444" : "#64748B";
          return (
            <div key={i} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-1"><span className="text-[8px] text-white/25 font-mono uppercase tracking-wider">{p.label}</span><TI className="w-3 h-3" style={{ color: tc }} /></div>
              <p className="text-[14px] font-black text-white/80">{p.value}</p>
              <p className="text-[8px] text-white/20 font-mono mt-0.5">{p.context}</p>
            </div>
          );
        })}
      </motion.div>

      {/* NARRATIVES */}
      <div className="space-y-2.5">{db.narratives.map((n, i) => <NCard key={n.id} n={n} idx={i} />)}</div>
    </div>
  );
}
