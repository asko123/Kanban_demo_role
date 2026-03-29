"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { KanbanCard, CardStatus, COLUMN_LABELS, WIP_LIMITS, Role } from "@/types";
import { KanbanCardComponent } from "./KanbanCard";

const STATUS_COLORS: Record<CardStatus, string> = {
  backlog: "from-slate-500/40 to-slate-600/40",
  todo: "from-amber-500/40 to-orange-500/40",
  in_progress: "from-blue-500/40 to-cyan-500/40",
  review: "from-violet-500/40 to-purple-500/40",
  done: "from-teal-500/40 to-green-500/40",
};

const STATUS_GLOW: Record<CardStatus, string> = {
  backlog: "rgba(100,116,139,0.15)",
  todo: "rgba(245,158,11,0.15)",
  in_progress: "rgba(59,130,246,0.15)",
  review: "rgba(167,139,250,0.15)",
  done: "rgba(45,212,191,0.15)",
};

interface Props {
  status: CardStatus;
  cards: KanbanCard[];
  role: Role;
}

export function KanbanColumn({ status, cards, role }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const wipLimit = WIP_LIMITS[status];
  const isOverWip = cards.length > wipLimit;
  const showWip = role === "scrum-master";

  return (
    <div
      ref={setNodeRef}
      className={`
        relative flex flex-col min-w-[270px] w-[270px] shrink-0
        rounded-xl backdrop-blur-xl
        bg-white/[0.03] border border-white/[0.08]
        shadow-[0_0_20px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.04)]
        transition-all duration-300
        ${isOver ? "border-teal-400/30 shadow-[0_0_40px_rgba(45,212,191,0.1),inset_0_1px_0_rgba(45,212,191,0.1)]" : ""}
      `}
    >
      {/* Column header */}
      <div className="px-4 py-3 border-b border-white/[0.06] relative overflow-hidden">
        {/* Status color accent bar */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${STATUS_COLORS[status]}`} />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_GLOW[status], boxShadow: `0 0 8px ${STATUS_GLOW[status]}` }} />
            <h2 className="text-[11px] font-bold text-slate-200 uppercase tracking-[0.15em]">
              {COLUMN_LABELS[status]}
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-400 font-mono border border-white/[0.06]">
              {cards.length}
            </span>
          </div>
          {showWip && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-md font-mono border ${
                isOverWip
                  ? "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)] animate-pulse"
                  : "bg-white/[0.04] border-white/[0.06] text-slate-500"
              }`}
            >
              {cards.length}/{wipLimit}
            </span>
          )}
        </div>

        {/* Drop zone indicator */}
        <motion.div
          className="h-[1px] mt-2.5 rounded-full"
          animate={{
            background: isOver
              ? "linear-gradient(90deg, transparent, rgba(45,212,191,0.6), transparent)"
              : "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
            boxShadow: isOver ? "0 0 10px rgba(45,212,191,0.2)" : "none",
          }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Cards list */}
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 p-2 space-y-2.5 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-thin">
          {cards.map((card, idx) => (
            <KanbanCardComponent key={card.id} card={card} index={idx} />
          ))}
          {cards.length === 0 && (
            <div className="flex flex-col items-center justify-center h-24 text-xs text-slate-600 gap-1">
              <div className="w-6 h-6 rounded border border-dashed border-white/[0.08]" />
              <span className="italic font-mono text-[10px]">EMPTY</span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
