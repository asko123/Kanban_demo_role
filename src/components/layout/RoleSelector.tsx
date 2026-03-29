"use client";

import { motion } from "framer-motion";
import { Crown, Shield, Code2 } from "lucide-react";
import { Role } from "@/types";
import { useBoardStore } from "@/store";

const roles: { id: Role; label: string; icon: typeof Crown; color: string }[] = [
  { id: "product-owner", label: "Product Owner", icon: Crown, color: "from-amber-400 to-orange-500" },
  { id: "scrum-master", label: "Scrum Master", icon: Shield, color: "from-teal-400 to-cyan-400" },
  { id: "developer", label: "Developer", icon: Code2, color: "from-violet-400 to-purple-500" },
];

export function RoleSelector() {
  const currentRole = useBoardStore((s) => s.role);
  const setRole = useBoardStore((s) => s.setRole);

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
      {roles.map(({ id, label, icon: Icon, color }) => {
        const isActive = currentRole === id;
        return (
          <button
            key={id}
            onClick={() => setRole(id)}
            data-testid={`role-${id}`}
            className={`
              relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium
              transition-all duration-300
              ${isActive ? "text-white" : "text-slate-500 hover:text-slate-300"}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="role-pill"
                className={`absolute inset-0 rounded-lg bg-gradient-to-r ${color} opacity-15`}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {isActive && (
              <motion.div
                layoutId="role-border"
                className="absolute inset-0 rounded-lg border border-white/[0.15] shadow-[0_0_15px_rgba(45,212,191,0.1)]"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? "drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]" : ""}`} />
            <span className="relative z-10 hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
