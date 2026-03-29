"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { KanbanCard, CardStatus, COLUMN_LABELS, WIP_LIMITS, Role } from "@/types";
import { KanbanCardComponent } from "./KanbanCard";

const STATUS_ACCENT: Record<CardStatus, { color: string; glow: string }> = {
  backlog: { color: "#64748B", glow: "rgba(100,116,139,0.3)" },
  todo: { color: "#F59E0B", glow: "rgba(245,158,11,0.3)" },
  in_progress: { color: "#22D3EE", glow: "rgba(34,211,238,0.3)" },
  review: { color: "#A78BFA", glow: "rgba(167,139,250,0.3)" },
  done: { color: "#2DD4BF", glow: "rgba(45,212,191,0.3)" },
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
  const accent = STATUS_ACCENT[status];

  return (
    <div
      ref={setNodeRef}
      className={`
        relative flex flex-col min-w-[280px] w-[280px] shrink-0
        rounded-2xl backdrop-blur-xl
        bg-gradient-to-b from-white/[0.04] to-white/[0.01]
        border border-white/[0.08]
        shadow-[0_4px_30px_rgba(0,0,0,0.25)]
        transition-all duration-500
        ${isOver ? "border-teal-400/40 shadow-[0_0_50px_rgba(45,212,191,0.12),0_4px_30px_rgba(0,0,0,0.3)]" : ""}
      `}
    >
      {/* Top accent bar with glow */}
      <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full" style={{
        backgroundColor: accent.color,
        boxShadow: `0 0 12px ${accent.glow}, 0 2px 8px ${accent.glow}`,
      }} />

      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full" style={{
              backgroundColor: accent.color,
              boxShadow: `0 0 10px ${accent.glow}`,
            }} />
            <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">
              {COLUMN_LABELS[status]}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.06] text-white/60 font-mono border border-white/[0.06]">
              {cards.length}
            </span>
            {showWip && (
              <span className={`text-[11px] px-2.5 py-1 rounded-lg font-mono border ${
                isOverWip
                  ? "bg-red-500/15 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse"
                  : "bg-white/[0.04] border-white/[0.06] text-white/40"
              }`}>
                WIP {cards.length}/{wipLimit}
              </span>
            )}
          </div>
        </div>

        {/* Drop indicator beam */}
        <motion.div className="h-[1px] mt-3 rounded-full overflow-hidden" animate={{
          background: isOver
            ? `linear-gradient(90deg, transparent, ${accent.color}, transparent)`
            : "linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)",
          boxShadow: isOver ? `0 0 15px ${accent.glow}` : "none",
        }} transition={{ duration: 0.3 }} />
      </div>

      {/* Cards */}
      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 p-2.5 space-y-3 overflow-y-auto max-h-[calc(100vh-240px)] scrollbar-thin">
          {cards.map((card, idx) => (
            <KanbanCardComponent key={card.id} card={card} index={idx} />
          ))}
          {cards.length === 0 && (
            <div className="flex flex-col items-center justify-center h-28 gap-2">
              <div className="w-8 h-8 rounded-lg border border-dashed border-white/[0.08] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white/[0.06]" />
              </div>
              <span className="text-[10px] text-white/20 font-mono tracking-widest">EMPTY</span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
