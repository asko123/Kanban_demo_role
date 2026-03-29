"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  GitBranch,
  CheckCircle2,
  Circle,
  User,
  Flame,
} from "lucide-react";
import { KanbanCard as CardType, PRIORITY_COLORS, Role } from "@/types";
import { useBoardStore } from "@/store";
import { useCardTilt } from "@/hooks/useCardTilt";
import { currentDeveloper } from "@/data/team";

interface Props {
  card: CardType;
  index: number;
}

export function KanbanCardComponent({ card, index }: Props) {
  const role = useBoardStore((s) => s.role);
  const toggleSubtask = useBoardStore((s) => s.toggleSubtask);
  const assignCard = useBoardStore((s) => s.assignCard);
  const { ref: tiltRef, springX, springY, onMouseMove, onMouseLeave } = useCardTilt();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { status: card.status } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const completedSubtasks = card.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = card.subtasks.length;
  const subtaskProgress =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <motion.div
      ref={(node) => {
        setNodeRef(node);
        (tiltRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      style={{
        ...style,
        perspective: 600,
        rotateX: springX,
        rotateY: springY,
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        y: 0,
        scale: isDragging ? 1.03 : 1,
      }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className={`
        group relative rounded-xl p-3.5 cursor-grab active:cursor-grabbing
        border transition-all duration-200
        bg-white/[0.03] backdrop-blur-xl border-white/[0.08]
        shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
        hover:border-white/[0.15] hover:shadow-[0_0_20px_rgba(45,212,191,0.08)]
        hover:-translate-y-0.5
        ${isDragging ? "shadow-2xl z-50" : ""}
        ${card.blockedReason && role === "scrum-master" ? "ring-2 ring-red-500/50 animate-pulse" : ""}
      `}
      {...attributes}
      {...listeners}
    >
      {/* Priority heat strip (always visible, prominent for PO) */}
      <div
        className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
        style={{ backgroundColor: PRIORITY_COLORS[card.priority] }}
      />

      <div className="pl-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-medium text-slate-200 leading-snug">
            {card.title}
          </h3>
          {card.priority === "P0" && role === "product-owner" && (
            <Flame className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
          )}
        </div>

        {/* PO: Value/Effort badge */}
        {role === "product-owner" && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 font-medium">
              Val {card.valueScore}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 font-medium">
              {card.storyPoints} pts
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-slate-400">
              {card.epic.split(" ").slice(0, 2).join(" ")}
            </span>
          </div>
        )}

        {/* SM: Blocker indicator */}
        {role === "scrum-master" && card.blockedReason && (
          <div className="flex items-center gap-1.5 mb-2 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span className="text-[10px] text-red-300 truncate">
              {card.blockedReason}
            </span>
          </div>
        )}

        {/* Dev: Subtask checklist */}
        {role === "developer" && totalSubtasks > 0 && (
          <div className="mb-2 space-y-1">
            {card.subtasks.map((st) => (
              <button
                key={st.id}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSubtask(card.id, st.id);
                }}
                className="flex items-center gap-1.5 w-full text-left group/st"
              >
                {st.completed ? (
                  <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />
                ) : (
                  <Circle className="w-3 h-3 text-slate-500 shrink-0 group-hover/st:text-slate-400" />
                )}
                <span
                  className={`text-[11px] ${
                    st.completed
                      ? "text-slate-500 line-through"
                      : "text-slate-400"
                  }`}
                >
                  {st.title}
                </span>
              </button>
            ))}
            {/* Progress ring */}
            <div className="flex items-center gap-1.5 mt-1">
              <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0">
                <circle
                  cx="7" cy="7" r="5" fill="none"
                  stroke="rgba(255,255,255,0.08)" strokeWidth="2"
                />
                <circle
                  cx="7" cy="7" r="5" fill="none"
                  stroke="#2DD4BF" strokeWidth="2"
                  strokeDasharray={`${(subtaskProgress / 100) * 31.4} 31.4`}
                  strokeLinecap="round"
                  transform="rotate(-90 7 7)"
                />
              </svg>
              <span className="text-[10px] text-slate-500">
                {completedSubtasks}/{totalSubtasks}
              </span>
            </div>
          </div>
        )}

        {/* Dev: PR Link badge */}
        {role === "developer" && card.prLink && (
          <div className="flex items-center gap-1.5 mb-2">
            <GitBranch className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] text-slate-400 font-mono truncate">
              {card.prLink.branch}
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                card.prLink.status === "merged"
                  ? "bg-violet-500/15 text-violet-400"
                  : card.prLink.status === "open"
                  ? "bg-green-500/15 text-green-400"
                  : "bg-slate-500/15 text-slate-400"
              }`}
            >
              {card.prLink.status}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.05]">
          {/* Assignee */}
          {card.assignee ? (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-500/30 to-violet-500/30 flex items-center justify-center">
                <span className="text-[8px] font-bold text-slate-300">
                  {card.assignee.avatar}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                {card.assignee.name.split(" ")[0]}
              </span>
            </div>
          ) : role === "developer" ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                assignCard(card.id, currentDeveloper.id);
              }}
              className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-teal-400 transition-colors opacity-0 group-hover:opacity-100"
            >
              <User className="w-3 h-3" />
              Take it
            </button>
          ) : (
            <span className="text-[10px] text-slate-600 italic">Unassigned</span>
          )}

          {/* Story points (SM view) */}
          {role === "scrum-master" && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono">
              {card.storyPoints}sp
            </span>
          )}

          {/* Labels */}
          <div className="flex gap-1">
            {card.labels.slice(0, 2).map((label) => (
              <span
                key={label}
                className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
