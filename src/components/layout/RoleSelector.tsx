"use client";

import { motion } from "framer-motion";
import { Crown, Shield, Code2 } from "lucide-react";
import { Role } from "@/types";
import { useBoardStore } from "@/store";

const roles: { id: Role; label: string; icon: typeof Crown; gradient: string; glow: string }[] = [
  { id: "product-owner", label: "Product Owner", icon: Crown, gradient: "from-amber-400 to-orange-500", glow: "rgba(245,158,11,0.4)" },
  { id: "scrum-master", label: "Scrum Master", icon: Shield, gradient: "from-teal-400 to-cyan-400", glow: "rgba(45,212,191,0.4)" },
  { id: "developer", label: "Developer", icon: Code2, gradient: "from-violet-400 to-purple-500", glow: "rgba(167,139,250,0.4)" },
];

export function RoleSelector() {
  const currentRole = useBoardStore((s) => s.role);
  const setRole = useBoardStore((s) => s.setRole);

  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl">
      {roles.map(({ id, label, icon: Icon, gradient, glow }) => {
        const active = currentRole === id;
        return (
          <button
            key={id}
            onClick={() => setRole(id)}
            data-testid={`role-${id}`}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              active ? "text-white" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {active && (
              <>
                <motion.div
                  layoutId="role-bg"
                  className={`absolute inset-0 rounded-xl bg-gradient-to-r ${gradient} opacity-[0.12]`}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
                <motion.div
                  layoutId="role-border"
                  className="absolute inset-0 rounded-xl glow-border glow-border-fast"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  style={{ boxShadow: `0 0 20px ${glow}, inset 0 1px 0 rgba(255,255,255,0.1)` }}
                />
              </>
            )}
            <Icon className={`w-4 h-4 relative z-10 ${active ? "drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]" : ""}`} />
            <span className="relative z-10 hidden sm:inline tracking-wide">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
