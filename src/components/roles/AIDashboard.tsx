"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit, AlertTriangle, GitBranch, GitPullRequest, Zap,
  Target, Layers, Tag, ListTodo, ShieldAlert, CheckCircle2,
  ChevronRight, Clock, TrendingUp, CircleDot,
} from "lucide-react";
import { useBoardStore } from "@/store";
import { generateDashboard, DashboardModule } from "@/data/ai-dashboard";

const MODULE_ICONS: Record<string, typeof BrainCircuit> = {
  "blocked-items": ShieldAlert,
  "active-work": CircleDot,
  "subtask-completion": ListTodo,
  "your-prs": GitBranch,
  "team-reviews": GitPullRequest,
  "high-priority": AlertTriangle,
  "velocity": Zap,
  "epic-focus": Layers,
  "domain-expertise": Tag,
  "upcoming-queue": Target,
  "pr-activity": TrendingUp,
};

const MODULE_COLORS: Record<string, { accent: string; bg: string; border: string }> = {
  "blocked-items": { accent: "#EF4444", bg: "bg-red-500/6", border: "border-red-500/15" },
  "active-work": { accent: "#22D3EE", bg: "bg-cyan-500/6", border: "border-cyan-500/15" },
  "subtask-completion": { accent: "#F59E0B", bg: "bg-amber-500/6", border: "border-amber-500/15" },
  "your-prs": { accent: "#A78BFA", bg: "bg-violet-500/6", border: "border-violet-500/15" },
  "team-reviews": { accent: "#3B82F6", bg: "bg-blue-500/6", border: "border-blue-500/15" },
  "high-priority": { accent: "#F97316", bg: "bg-orange-500/6", border: "border-orange-500/15" },
  "velocity": { accent: "#2DD4BF", bg: "bg-teal-500/6", border: "border-teal-500/15" },
  "epic-focus": { accent: "#8B5CF6", bg: "bg-purple-500/6", border: "border-purple-500/15" },
  "domain-expertise": { accent: "#06B6D4", bg: "bg-cyan-500/6", border: "border-cyan-500/15" },
  "upcoming-queue": { accent: "#10B981", bg: "bg-emerald-500/6", border: "border-emerald-500/15" },
  "pr-activity": { accent: "#A78BFA", bg: "bg-violet-500/6", border: "border-violet-500/15" },
};

const fallback = { accent: "#64748B", bg: "bg-slate-500/6", border: "border-slate-500/15" };

function ModuleCard({ mod, index }: { mod: DashboardModule; index: number }) {
  const [expanded, setExpanded] = useState(index < 3);
  const Icon = MODULE_ICONS[mod.id] ?? CircleDot;
  const colors = MODULE_COLORS[mod.id] ?? fallback;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full text-left rounded-xl border backdrop-blur-sm transition-all duration-300 overflow-hidden relative ${colors.bg} ${colors.border} hover:brightness-125`}
      >
        {/* Left accent */}
        <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full"
          style={{ backgroundColor: colors.accent, boxShadow: `0 0 8px ${colors.accent}40` }} />

        <div className="p-3 pl-4">
          {/* Header row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: colors.accent, filter: `drop-shadow(0 0 4px ${colors.accent}60)` }} />
              <span className="text-[11px] font-bold text-white truncate">{mod.type}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40 font-mono border border-white/[0.04]">
                {mod.data.length}
              </span>
              <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
                <ChevronRight className="w-3 h-3 text-white/20" />
              </motion.div>
            </div>
          </div>

          {/* AI reasoning line */}
          <p className="text-[9px] text-white/30 mt-1 leading-relaxed font-mono italic truncate">
            {mod.reasoning}
          </p>
        </div>
      </button>

      {/* Expanded data */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-1 space-y-1.5">
              {mod.data.map((item, i) => (
                <DataRow key={i} item={item} accent={colors.accent} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DataRow({ item, accent }: { item: Record<string, unknown>; accent: string }) {
  const card = (item.card ?? item.epic ?? item.branch ?? "") as string;
  const entries = Object.entries(item).filter(
    ([k]) => k !== "card" && k !== "remaining" && k !== "allEpics" && k !== "branches"
  );

  return (
    <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
      {card && (
        <p className="text-[11px] text-white/80 font-medium truncate mb-1">{card}</p>
      )}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {entries.map(([key, val]) => {
          if (val === null || val === undefined || typeof val === "object") return null;
          return (
            <span key={key} className="text-[9px] text-white/30 font-mono">
              <span className="text-white/15">{key}:</span>{" "}
              <span style={{ color: `${accent}99` }}>{String(val)}</span>
            </span>
          );
        })}
      </div>

      {/* Nested arrays like remaining subtasks */}
      {Array.isArray(item.remaining) && (item.remaining as string[]).length > 0 && (
        <div className="mt-1 space-y-0.5">
          {(item.remaining as string[]).map((r, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-amber-400/40" />
              <span className="text-[9px] text-white/30">{r}</span>
            </div>
          ))}
        </div>
      )}

      {/* Nested epic breakdown */}
      {Array.isArray(item.allEpics) && (
        <div className="mt-1.5 space-y-1">
          {(item.allEpics as { name: string; cards: number }[]).map((e, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-[9px] text-white/30 truncate">{e.name}</span>
              <span className="text-[9px] font-mono" style={{ color: `${accent}80` }}>{e.cards}</span>
            </div>
          ))}
        </div>
      )}

      {/* PR branches list */}
      {Array.isArray(item.branches) && (
        <div className="mt-1.5 space-y-1">
          {(item.branches as { branch: string; status: string; card: string }[]).map((b, i) => (
            <div key={i} className="flex items-center gap-2">
              <GitBranch className="w-2.5 h-2.5 text-white/15" />
              <span className="text-[9px] text-cyan-400/50 font-mono truncate">{b.branch}</span>
              <span className={`text-[8px] px-1 rounded font-bold ${
                b.status === "merged" ? "text-violet-400/60" : b.status === "open" ? "text-green-400/60" : "text-white/20"
              }`}>
                {b.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AIDashboard() {
  const boardCards = useBoardStore((s) => s.cards);
  const currentDevId = useBoardStore((s) => s.currentDevId);

  const dashboard = useMemo(
    () => generateDashboard(currentDevId, boardCards),
    [currentDevId, boardCards]
  );

  return (
    <div className="space-y-4">
      {/* AI header */}
      <div className="relative rounded-2xl glow-border glow-border-slow overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.03] via-transparent to-teal-500/[0.03] rounded-2xl" />
        <div className="relative backdrop-blur-2xl bg-white/[0.03] p-4 rounded-2xl">
          {/* Sweep beam */}
          <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden rounded-t-2xl">
            <motion.div className="absolute inset-y-0 w-1/2"
              style={{ background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.8), rgba(45,212,191,0.5), transparent)" }}
              animate={{ left: ["-50%", "100%"] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/25 to-teal-500/25 flex items-center justify-center border border-white/[0.1]">
                <BrainCircuit className="w-5 h-5 text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
              </div>
              <motion.div className="absolute -inset-1 rounded-xl"
                style={{ background: "conic-gradient(from 0deg, rgba(167,139,250,0.15), rgba(45,212,191,0.08), rgba(167,139,250,0.15))" }}
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <div>
              <h3 className="text-xs font-black text-white tracking-[0.15em] text-glow-violet">
                AI DASHBOARD
              </h3>
              <p className="text-[8px] text-violet-400/50 font-mono tracking-[0.2em] mt-0.5">
                CURATED FOR {dashboard.developer.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Signal summary */}
          <div className="flex items-start gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <Clock className="w-3 h-3 text-teal-400/50 mt-0.5 shrink-0" />
            <p className="text-[10px] text-white/40 font-mono leading-relaxed">
              {dashboard.signalSummary}
            </p>
          </div>
        </div>
      </div>

      {/* Module cards */}
      <div className="space-y-2.5">
        {dashboard.dashboardItems.map((mod, idx) => (
          <ModuleCard key={mod.id} mod={mod} index={idx} />
        ))}
      </div>
    </div>
  );
}
