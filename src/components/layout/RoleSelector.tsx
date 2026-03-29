"use client";

import { motion } from "framer-motion";
import { Crown, Shield, Code2 } from "lucide-react";
import { Role } from "@/types";
import { useBoardStore } from "@/store";

const roles: { id: Role; label: string; icon: typeof Crown }[] = [
  { id: "product-owner", label: "Product Owner", icon: Crown },
  { id: "scrum-master", label: "Scrum Master", icon: Shield },
  { id: "developer", label: "Developer", icon: Code2 },
];

export function RoleSelector() {
  const currentRole = useBoardStore((s) => s.role);
  const setRole = useBoardStore((s) => s.setRole);

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
      {roles.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setRole(id)}
          data-testid={`role-${id}`}
          className={`
            relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
            transition-colors duration-200
            ${
              currentRole === id
                ? "text-slate-100"
                : "text-slate-500 hover:text-slate-300"
            }
          `}
        >
          {currentRole === id && (
            <motion.div
              layoutId="role-pill"
              className="absolute inset-0 rounded-lg bg-white/[0.08] border border-white/[0.1]"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <Icon className="w-3.5 h-3.5 relative z-10" />
          <span className="relative z-10 hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
