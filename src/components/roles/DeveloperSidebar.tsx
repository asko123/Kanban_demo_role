"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useBoardStore } from "@/store";
import { team } from "@/data/team";
import { AIDashboard } from "./AIDashboard";

const developers = team.filter((t) => t.role === "developer");

export function DeveloperSidebar() {
  const currentDevId = useBoardStore((s) => s.currentDevId);
  const setCurrentDev = useBoardStore((s) => s.setCurrentDev);
  const currentDev = developers.find((d) => d.id === currentDevId) ?? developers[0];

  return (
    <>
      {/* Developer Switcher */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-teal-400" />
          <h3 className="text-[11px] font-bold text-white uppercase tracking-[0.15em]">
            Developer
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {developers.map((dev) => {
            const active = dev.id === currentDevId;
            return (
              <button
                key={dev.id}
                onClick={() => setCurrentDev(dev.id)}
                data-testid={`dev-switch-${dev.id}`}
                className={`
                  relative flex items-center gap-2 p-2.5 rounded-xl border transition-all duration-300
                  ${active
                    ? "border-teal-500/25 shadow-[0_0_16px_rgba(45,212,191,0.08)]"
                    : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]"
                  }
                `}
              >
                {active && (
                  <motion.div
                    layoutId="dev-pill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/20"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <div className={`
                  relative z-10 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border
                  ${active
                    ? "bg-gradient-to-br from-teal-500/40 to-violet-500/40 border-white/[0.15] shadow-[0_0_8px_rgba(45,212,191,0.2)]"
                    : "bg-gradient-to-br from-teal-500/15 to-violet-500/15 border-white/[0.06]"
                  }
                `}>
                  <span className={`text-[9px] font-black ${active ? "text-white" : "text-white/40"}`}>
                    {dev.avatar}
                  </span>
                </div>
                <span className={`relative z-10 text-[11px] font-semibold truncate ${active ? "text-teal-300" : "text-white/40"}`}>
                  {dev.name.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active dev name bar */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/40 to-violet-500/40 border border-white/[0.1] flex items-center justify-center shadow-[0_0_12px_rgba(45,212,191,0.1)]">
          <span className="text-sm font-black text-white">{currentDev.avatar}</span>
        </div>
        <div>
          <p className="text-sm text-white font-bold">{currentDev.name}</p>
          <p className="text-[9px] text-teal-400/50 font-mono tracking-wider">DEVELOPER · AI VIEW</p>
        </div>
      </div>

      {/* AI-Curated Dashboard — no manual filters */}
      <AIDashboard />
    </>
  );
}
