"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { KanbanCard, CardStatus, COLUMN_LABELS, WIP_LIMITS, Role } from "@/types";
import { KanbanCardComponent } from "./KanbanCard";

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
        flex flex-col min-w-[260px] w-[260px] shrink-0
        rounded-xl bg-white/[0.02] border border-white/[0.06]
        transition-all duration-300
        ${isOver ? "border-teal-500/30 shadow-[0_0_30px_rgba(45,212,191,0.06)]" : ""}
      `}
    >
      {/* Column header */}
      <div className="px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {COLUMN_LABELS[status]}
            </h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-slate-500 font-mono">
              {cards.length}
            </span>
          </div>
          {showWip && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                isOverWip
                  ? "bg-red-500/15 text-red-400 animate-pulse"
                  : "bg-white/5 text-slate-500"
              }`}
            >
              {cards.length}/{wipLimit}
            </span>
          )}
        </div>
        {/* Hover glow bar */}
        <motion.div
          className="h-0.5 mt-2 rounded-full"
          animate={{
            backgroundColor: isOver
              ? "rgba(45,212,191,0.4)"
              : "rgba(255,255,255,0.04)",
          }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Cards list */}
      <SortableContext
        items={cards.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-thin">
          {cards.map((card, idx) => (
            <KanbanCardComponent key={card.id} card={card} index={idx} />
          ))}
          {cards.length === 0 && (
            <div className="flex items-center justify-center h-20 text-xs text-slate-600 italic">
              No cards
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
