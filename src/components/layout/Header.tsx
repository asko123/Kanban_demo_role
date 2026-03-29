"use client";

import { LayoutDashboard } from "lucide-react";
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
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/[0.02] border-b border-white/[0.06]">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-violet-500 flex items-center justify-center">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-200 tracking-tight">
              Kanban Dashboard
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              {ROLE_LABELS[role]} View
            </p>
          </div>
        </div>

        <RoleSelector />
      </div>
    </header>
  );
}
