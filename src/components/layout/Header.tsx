"use client";

import { motion } from "framer-motion";
import { Cpu } from "lucide-react";
import { Role } from "@/types";
import { useBoardStore } from "@/store";
import { RoleSelector } from "./RoleSelector";

const ROLE_LABELS: Record<Role, string> = {
  "product-owner": "Product Owner",
  "scrum-master": "Scrum Master",
  developer: "Developer",
};

export function Header() {
  const role = useBoardStore((s) => s.role);

  return (
    <header className="sticky top-0 z-40">
      {/* Glass bar */}
      <div className="backdrop-blur-2xl bg-white/[0.03] border-b border-white/[0.08]">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-400 via-cyan-400 to-violet-500 flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.3)]">
                <Cpu className="w-4.5 h-4.5 text-white" />
              </div>
              <motion.div
                className="absolute -inset-0.5 rounded-lg bg-gradient-to-br from-teal-400/20 to-violet-500/20"
                animate={{ opacity: [0.5, 0.2, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight neon-text">
                NEXUS<span className="text-teal-400">BOARD</span>
              </h1>
              <div className="flex items-center gap-1.5">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-teal-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <p className="text-[10px] text-teal-400/70 uppercase tracking-[0.2em] font-mono">
                  {ROLE_LABELS[role]}
                </p>
              </div>
            </div>
          </div>

          <RoleSelector />
        </div>
      </div>

      {/* Animated bottom border line */}
      <div className="h-[1px] relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 w-1/3"
          style={{ background: "linear-gradient(90deg, transparent, rgba(45,212,191,0.5), rgba(34,211,238,0.3), transparent)" }}
          animate={{ left: ["-33%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </header>
  );
}
