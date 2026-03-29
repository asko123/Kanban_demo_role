"use client";

import { motion } from "framer-motion";
import { Cpu, Activity } from "lucide-react";
import { Role } from "@/types";
import { useBoardStore } from "@/store";
import { RoleSelector } from "./RoleSelector";

const ROLE_LABELS: Record<Role, string> = {
  "product-owner": "PRODUCT OWNER",
  "scrum-master": "SCRUM MASTER",
  developer: "DEVELOPER",
};

export function Header() {
  const role = useBoardStore((s) => s.role);

  return (
    <header className="sticky top-0 z-40">
      <div className="relative backdrop-blur-2xl bg-black/40 border-b border-white/[0.06]">
        <div className="max-w-[1600px] mx-auto px-6 h-[72px] flex items-center justify-between">
          {/* Logo block */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-400 via-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_30px_rgba(45,212,191,0.4)]">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-teal-400/30 to-violet-500/30 blur-md -z-10" />
              <motion.div
                className="absolute -inset-1 rounded-xl border border-teal-400/20"
                animate={{ opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ animation: "pulse-ring 3s ease-out infinite" }}
              />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight">
                <span className="text-white text-glow">NEXUS</span>
                <span className="text-teal-400 text-glow">BOARD</span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]"
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <p className="text-[10px] text-teal-400/80 font-mono tracking-[0.25em]">
                  {ROLE_LABELS[role]}
                </p>
                <Activity className="w-3 h-3 text-teal-400/40" />
                <span className="text-[9px] text-white/20 font-mono">SYS.OK</span>
              </div>
            </div>
          </div>

          <RoleSelector />
        </div>

        {/* Animated border beam */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] overflow-hidden">
          <motion.div
            className="absolute inset-y-0 w-[40%]"
            style={{ background: "linear-gradient(90deg, transparent, rgba(45,212,191,0.7), rgba(34,211,238,0.5), rgba(167,139,250,0.7), transparent)" }}
            animate={{ left: ["-40%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-transparent to-violet-500/10" />
        </div>
      </div>
    </header>
  );
}
