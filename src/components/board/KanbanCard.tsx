"use client";

import { useRef, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  AlertTriangle,
  GitBranch,
  CheckCircle2,
  Circle,
  User,
  Flame,
} from "lucide-react";
import { KanbanCard as CardType, PRIORITY_COLORS } from "@/types";
import { useBoardStore } from "@/store";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { currentDeveloper } from "@/data/team";

interface Props {
  card: CardType;
  index: number;
}

export function KanbanCardComponent({ card, index }: Props) {
  const role = useBoardStore((s) => s.role);
  const toggleSubtask = useBoardStore((s) => s.toggleSubtask);
  const assignCard = useBoardStore((s) => s.assignCard);
  const reduced = useReducedMotion();
  const tiltRef = useRef<HTMLDivElement>(null);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 260, damping: 25 });
  const springY = useSpring(rotateY, { stiffness: 260, damping: 25 });
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { status: card.status } });

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (reduced || !tiltRef.current) return;
      const rect = tiltRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const maxTilt = 6;
      rotateX.set(-((e.clientY - cy) / (rect.height / 2)) * maxTilt);
      rotateY.set(((e.clientX - cx) / (rect.width / 2)) * maxTilt);
      glowX.set(((e.clientX - rect.left) / rect.width) * 100);
      glowY.set(((e.clientY - rect.top) / rect.height) * 100);
    },
    [reduced, rotateX, rotateY, glowX, glowY]
  );

  const onMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    glowX.set(50);
    glowY.set(50);
  }, [rotateX, rotateY, glowX, glowY]);

  const completedSubtasks = card.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = card.subtasks.length;
  const subtaskProgress =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    /* Outer wrapper: dnd-kit controls this transform */
    <div ref={setNodeRef} style={dndStyle}>
      {/* Inner wrapper: Framer Motion controls tilt + glow here */}
      <motion.div
        ref={tiltRef}
        style={{
          perspective: 800,
          rotateX: springX,
          rotateY: springY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        initial={{ opacity: 0, y: 24 }}
        animate={{
          opacity: isDragging ? 0.4 : 1,
          y: 0,
          scale: isDragging ? 1.04 : 1,
        }}
        transition={{ delay: index * 0.04, duration: 0.35, ease: "easeOut" }}
        whileHover={{ y: -3, transition: { duration: 0.15 } }}
        className={`
          group relative rounded-xl p-3.5 cursor-grab active:cursor-grabbing
          border transition-colors duration-200
          bg-white/[0.03] backdrop-blur-xl border-white/[0.08]
          shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]
          hover:border-white/[0.18]
          hover:shadow-[0_0_24px_rgba(45,212,191,0.1),0_8px_32px_rgba(0,0,0,0.3)]
          ${isDragging ? "shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50" : ""}
          ${card.blockedReason && role === "scrum-master" ? "ring-2 ring-red-500/50 animate-pulse" : ""}
        `}
        {...attributes}
        {...listeners}
      >
        {/* Mouse-following inner glow */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glowX.get()}% ${glowY.get()}%, rgba(45,212,191,0.06) 0%, transparent 60%)`,
          }}
        />

        {/* Priority heat strip */}
        <div
          className="absolute left-0 top-3 bottom-3 w-1 rounded-full"
          style={{ backgroundColor: PRIORITY_COLORS[card.priority] }}
        />

        <div className="pl-3 relative z-10">
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
              <div className="flex items-center gap-1.5 mt-1">
                <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0">
                  <circle cx="7" cy="7" r="5" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" />
                  <circle
                    cx="7" cy="7" r="5" fill="none"
                    stroke="#2DD4BF" strokeWidth="2"
                    strokeDasharray={`${(subtaskProgress / 100) * 31.4} 31.4`}
                    strokeLinecap="round" transform="rotate(-90 7 7)"
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

            {role === "scrum-master" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono">
                {card.storyPoints}sp
              </span>
            )}

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
    </div>
  );
}
