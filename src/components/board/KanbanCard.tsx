"use client";

import { useRef, useCallback, useState, useEffect } from "react";
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

interface Props {
  card: CardType;
  index: number;
}

export function KanbanCardComponent({ card, index }: Props) {
  const role = useBoardStore((s) => s.role);
  const currentDevId = useBoardStore((s) => s.currentDevId);
  const toggleSubtask = useBoardStore((s) => s.toggleSubtask);
  const assignCard = useBoardStore((s) => s.assignCard);
  const reduced = useReducedMotion();
  const tiltRef = useRef<HTMLDivElement>(null);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { status: card.status } });

  const dndStyle = { transform: CSS.Transform.toString(transform), transition };

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (reduced || !tiltRef.current) return;
      const rect = tiltRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      rotateX.set(-((e.clientY - cy) / (rect.height / 2)) * 8);
      rotateY.set(((e.clientX - cx) / (rect.width / 2)) * 8);
      setGlowPos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    },
    [reduced, rotateX, rotateY]
  );

  const onMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
    setGlowPos({ x: 50, y: 50 });
  }, [rotateX, rotateY]);

  const completedSubtasks = card.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = card.subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  const priorityColor = PRIORITY_COLORS[card.priority];

  return (
    <div ref={setNodeRef} style={dndStyle}>
      <motion.div
        ref={tiltRef}
        style={{ perspective: 800, rotateX: springX, rotateY: springY, transformStyle: "preserve-3d" }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: isDragging ? 0.4 : 1, y: 0, scale: isDragging ? 1.05 : 1 }}
        transition={{ delay: index * 0.04, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={{ y: -4, transition: { duration: 0.15 } }}
        className={`
          group relative rounded-xl p-3.5 cursor-grab active:cursor-grabbing
          transition-all duration-300 overflow-hidden
          backdrop-blur-2xl
          bg-gradient-to-br from-white/[0.07] to-white/[0.03]
          border border-white/[0.12]
          shadow-[inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(0,0,0,0.1),0_4px_16px_rgba(0,0,0,0.2)]
          hover:border-white/[0.25]
          hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_30px_rgba(45,212,191,0.1),0_8px_32px_rgba(0,0,0,0.4)]
          ${isDragging ? "shadow-[0_25px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(45,212,191,0.15)] z-50 border-teal-400/30" : ""}
          ${card.blockedReason && role === "scrum-master" ? "ring-1 ring-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]" : ""}
        `}
        {...attributes}
        {...listeners}
      >
        {/* Mouse-following glow */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(45,212,191,0.12) 0%, transparent 50%)`,
          }}
        />

        {/* Top edge highlight gradient */}
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent" />

        {/* Priority heat strip - thicker, with glow */}
        <div
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
          style={{
            backgroundColor: priorityColor,
            boxShadow: `0 0 8px ${priorityColor}40, 0 0 16px ${priorityColor}20`,
          }}
        />

        <div className="pl-3.5 relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-[13px] font-semibold text-white/90 leading-snug tracking-tight">
              {card.title}
            </h3>
            {card.priority === "P0" && role === "product-owner" && (
              <Flame className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
            )}
          </div>

          {/* PO: Value/Effort badges */}
          {role === "product-owner" && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300 font-semibold border border-teal-500/20 shadow-[0_0_6px_rgba(45,212,191,0.1)]">
                Val {card.valueScore}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-300 font-semibold border border-violet-500/20">
                {card.storyPoints}pt
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-slate-400 border border-white/[0.06] font-mono">
                {card.epic.split(" ").slice(0, 2).join(" ")}
              </span>
            </div>
          )}

          {/* SM: Blocker indicator */}
          {role === "scrum-master" && card.blockedReason && (
            <motion.div
              animate={{ borderColor: ["rgba(239,68,68,0.2)", "rgba(239,68,68,0.4)", "rgba(239,68,68,0.2)"] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1.5 mb-2 px-2.5 py-1.5 rounded-lg bg-red-500/8 border"
            >
              <AlertTriangle className="w-3 h-3 text-red-400 drop-shadow-[0_0_4px_rgba(239,68,68,0.5)]" />
              <span className="text-[10px] text-red-300 truncate font-medium">{card.blockedReason}</span>
            </motion.div>
          )}

          {/* Dev: Subtask checklist */}
          {role === "developer" && totalSubtasks > 0 && (
            <div className="mb-2 space-y-1">
              {card.subtasks.map((st) => (
                <button key={st.id}
                  onClick={(e) => { e.stopPropagation(); toggleSubtask(card.id, st.id); }}
                  className="flex items-center gap-1.5 w-full text-left group/st"
                >
                  {st.completed
                    ? <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0 drop-shadow-[0_0_3px_rgba(45,212,191,0.5)]" />
                    : <Circle className="w-3 h-3 text-slate-500 shrink-0 group-hover/st:text-teal-400/50 transition-colors" />
                  }
                  <span className={`text-[11px] ${st.completed ? "text-slate-500 line-through" : "text-slate-300"}`}>
                    {st.title}
                  </span>
                </button>
              ))}
              <div className="flex items-center gap-1.5 mt-1.5">
                <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
                  <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                  <circle cx="8" cy="8" r="6" fill="none" stroke="url(#prog)" strokeWidth="2"
                    strokeDasharray={`${(subtaskProgress / 100) * 37.7} 37.7`}
                    strokeLinecap="round" transform="rotate(-90 8 8)"
                    style={{ filter: "drop-shadow(0 0 3px rgba(45,212,191,0.4))" }}
                  />
                  <defs><linearGradient id="prog" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2DD4BF" /><stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient></defs>
                </svg>
                <span className="text-[10px] text-slate-400 font-mono">{completedSubtasks}/{totalSubtasks}</span>
              </div>
            </div>
          )}

          {/* Dev: PR Link badge */}
          {role === "developer" && card.prLink && (
            <div className="flex items-center gap-1.5 mb-2">
              <GitBranch className="w-3 h-3 text-cyan-400/60" />
              <span className="text-[10px] text-cyan-300/70 font-mono truncate">{card.prLink.branch}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold border ${
                card.prLink.status === "merged" ? "bg-violet-500/15 text-violet-300 border-violet-500/20" :
                card.prLink.status === "open" ? "bg-green-500/15 text-green-300 border-green-500/20 shadow-[0_0_6px_rgba(34,197,94,0.1)]" :
                "bg-slate-500/10 text-slate-400 border-white/[0.06]"
              }`}>
                {card.prLink.status}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-white/[0.06]">
            {card.assignee ? (
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-400/30 to-violet-400/30 border border-white/[0.1] flex items-center justify-center shadow-[0_0_6px_rgba(45,212,191,0.1)]">
                  <span className="text-[7px] font-bold text-white/80">{card.assignee.avatar}</span>
                </div>
                <span className="text-[10px] text-slate-400">{card.assignee.name.split(" ")[0]}</span>
              </div>
            ) : role === "developer" ? (
              <button onClick={(e) => { e.stopPropagation(); assignCard(card.id, currentDevId); }}
                className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-teal-400 transition-all opacity-0 group-hover:opacity-100 hover:drop-shadow-[0_0_4px_rgba(45,212,191,0.4)]"
              >
                <User className="w-3 h-3" /> Take it
              </button>
            ) : (
              <span className="text-[10px] text-slate-600 italic font-mono">--</span>
            )}

            {role === "scrum-master" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-slate-400 font-mono border border-white/[0.06]">
                {card.storyPoints}sp
              </span>
            )}

            <div className="flex gap-1">
              {card.labels.slice(0, 2).map((label) => (
                <span key={label} className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-slate-500 border border-white/[0.04]">
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
