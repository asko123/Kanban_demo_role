"use client";

import { useRef, useCallback, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { AlertTriangle, GitBranch, CheckCircle2, Circle, User, Flame } from "lucide-react";
import { KanbanCard as CardType, PRIORITY_COLORS } from "@/types";
import { useBoardStore } from "@/store";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface Props { card: CardType; index: number; }

export function KanbanCardComponent({ card, index }: Props) {
  const role = useBoardStore((s) => s.role);
  const currentDevId = useBoardStore((s) => s.currentDevId);
  const toggleSubtask = useBoardStore((s) => s.toggleSubtask);
  const assignCard = useBoardStore((s) => s.assignCard);
  const reduced = useReducedMotion();
  const tiltRef = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 180, damping: 18 });
  const springY = useSpring(rotateY, { stiffness: 180, damping: 18 });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id, data: { status: card.status } });

  const dndStyle = { transform: CSS.Transform.toString(transform), transition };

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (reduced || !tiltRef.current) return;
    const r = tiltRef.current.getBoundingClientRect();
    rotateX.set(-((e.clientY - r.top - r.height / 2) / (r.height / 2)) * 10);
    rotateY.set(((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 10);
    setGlow({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  }, [reduced, rotateX, rotateY]);

  const onMouseLeave = useCallback(() => {
    rotateX.set(0); rotateY.set(0);
    setGlow({ x: 50, y: 50 }); setHovered(false);
  }, [rotateX, rotateY]);

  const done = card.subtasks.filter((s) => s.completed).length;
  const total = card.subtasks.length;
  const pct = total > 0 ? (done / total) * 100 : 0;
  const pc = PRIORITY_COLORS[card.priority];

  return (
    <div ref={setNodeRef} style={dndStyle}>
      <motion.div
        ref={tiltRef}
        style={{ perspective: 1000, rotateX: springX, rotateY: springY, transformStyle: "preserve-3d" }}
        onMouseMove={onMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={onMouseLeave}
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: isDragging ? 0.3 : 1, y: 0, scale: isDragging ? 1.06 : 1 }}
        transition={{ delay: index * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -6, transition: { duration: 0.2 } }}
        className={`
          group relative rounded-2xl p-4 cursor-grab active:cursor-grabbing
          overflow-hidden
          backdrop-blur-2xl
          bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-white/[0.02]
          border border-white/[0.12]
          shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3)]
          glow-border-hover
          ${isDragging ? "shadow-[0_30px_80px_rgba(0,0,0,0.7),0_0_60px_rgba(45,212,191,0.15)] z-50 border-teal-400/30" : ""}
          ${card.blockedReason && role === "scrum-master" ? "ring-1 ring-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]" : ""}
        `}
        {...attributes}
        {...listeners}
      >
        {/* Mouse-following spotlight inside card */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500"
          style={{
            opacity: hovered ? 1 : 0,
            background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(45,212,191,0.15) 0%, transparent 50%)`,
          }}
        />

        {/* Top highlight line */}
        <div className="absolute top-0 left-5 right-5 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Bottom subtle reflection */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/[0.02] to-transparent rounded-b-2xl pointer-events-none" />

        {/* Priority strip with glow */}
        <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
          style={{ backgroundColor: pc, boxShadow: `0 0 12px ${pc}60, 0 0 4px ${pc}40` }} />

        {/* Holographic shimmer on hover */}
        <div className={`absolute inset-0 rounded-2xl holo-shimmer pointer-events-none transition-opacity duration-500 ${hovered ? "opacity-100" : "opacity-0"}`} />

        <div className="pl-4 relative z-10">
          {/* Title */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-[13px] font-bold text-white leading-snug tracking-tight">
              {card.title}
            </h3>
            {card.priority === "P0" && role === "product-owner" && (
              <Flame className="w-4 h-4 text-red-400 shrink-0 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]" />
            )}
          </div>

          {/* PO badges */}
          {role === "product-owner" && (
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-teal-500/15 text-teal-300 font-bold border border-teal-500/25 shadow-[0_0_8px_rgba(45,212,191,0.1)]">
                VAL {card.valueScore}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-violet-500/15 text-violet-300 font-bold border border-violet-500/25">
                {card.storyPoints}PT
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-white/[0.05] text-white/40 font-mono border border-white/[0.06]">
                {card.epic.split(" ").slice(0, 2).join(" ")}
              </span>
            </div>
          )}

          {/* SM blocker */}
          {role === "scrum-master" && card.blockedReason && (
            <motion.div
              animate={{ borderColor: ["rgba(239,68,68,0.15)", "rgba(239,68,68,0.4)", "rgba(239,68,68,0.15)"] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 mb-2.5 px-3 py-2 rounded-xl bg-red-500/8 border"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
              <span className="text-[10px] text-red-300 font-medium truncate">{card.blockedReason}</span>
            </motion.div>
          )}

          {/* Dev subtasks */}
          {role === "developer" && total > 0 && (
            <div className="mb-2.5 space-y-1.5">
              {card.subtasks.map((st) => (
                <button key={st.id}
                  onClick={(e) => { e.stopPropagation(); toggleSubtask(card.id, st.id); }}
                  className="flex items-center gap-2 w-full text-left group/st"
                >
                  {st.completed
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 drop-shadow-[0_0_4px_rgba(45,212,191,0.6)]" />
                    : <Circle className="w-3.5 h-3.5 text-white/20 shrink-0 group-hover/st:text-teal-400/50 transition-colors" />
                  }
                  <span className={`text-[11px] ${st.completed ? "text-white/30 line-through" : "text-white/60"}`}>
                    {st.title}
                  </span>
                </button>
              ))}
              <div className="flex items-center gap-2 mt-1.5">
                <svg width="18" height="18" viewBox="0 0 18 18" className="shrink-0">
                  <circle cx="9" cy="9" r="7" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
                  <circle cx="9" cy="9" r="7" fill="none" stroke="url(#pg)" strokeWidth="2"
                    strokeDasharray={`${(pct / 100) * 44} 44`}
                    strokeLinecap="round" transform="rotate(-90 9 9)"
                    style={{ filter: "drop-shadow(0 0 4px rgba(45,212,191,0.5))" }} />
                  <defs><linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#2DD4BF" /><stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient></defs>
                </svg>
                <span className="text-[10px] text-white/40 font-mono">{done}/{total}</span>
              </div>
            </div>
          )}

          {/* Dev PR badge */}
          {role === "developer" && card.prLink && (
            <div className="flex items-center gap-2 mb-2.5">
              <GitBranch className="w-3 h-3 text-cyan-400/60" />
              <span className="text-[10px] text-cyan-300/60 font-mono truncate">{card.prLink.branch}</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-lg font-bold border ${
                card.prLink.status === "merged" ? "bg-violet-500/15 text-violet-300 border-violet-500/25" :
                card.prLink.status === "open" ? "bg-green-500/15 text-green-300 border-green-500/25 shadow-[0_0_8px_rgba(34,197,94,0.15)]" :
                "bg-white/[0.04] text-white/30 border-white/[0.06]"
              }`}>
                {card.prLink.status.toUpperCase()}
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/[0.06]">
            {card.assignee ? (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400/30 to-violet-400/30 border border-white/[0.12] flex items-center justify-center shadow-[0_0_8px_rgba(45,212,191,0.12)]">
                  <span className="text-[8px] font-black text-white/80">{card.assignee.avatar}</span>
                </div>
                <span className="text-[10px] text-white/40 font-medium">{card.assignee.name.split(" ")[0]}</span>
              </div>
            ) : role === "developer" ? (
              <button onClick={(e) => { e.stopPropagation(); assignCard(card.id, currentDevId); }}
                className="flex items-center gap-1.5 text-[10px] text-white/20 hover:text-teal-400 transition-all opacity-0 group-hover:opacity-100 hover:drop-shadow-[0_0_6px_rgba(45,212,191,0.5)]"
              >
                <User className="w-3.5 h-3.5" /> ASSIGN
              </button>
            ) : (
              <span className="text-[10px] text-white/15 font-mono">UNASSIGNED</span>
            )}

            {role === "scrum-master" && (
              <span className="text-[10px] px-2 py-0.5 rounded-lg bg-white/[0.04] text-white/40 font-mono border border-white/[0.06]">
                {card.storyPoints}SP
              </span>
            )}

            <div className="flex gap-1">
              {card.labels.slice(0, 2).map((label) => (
                <span key={label} className="text-[9px] px-2 py-0.5 rounded-lg bg-white/[0.04] text-white/30 border border-white/[0.04] font-mono">
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
