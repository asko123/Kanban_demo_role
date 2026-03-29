"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useBoardStore } from "@/store";
import { ProductOwnerSidebar } from "../roles/ProductOwnerSidebar";
import { ScrumMasterSidebar } from "../roles/ScrumMasterSidebar";
import { DeveloperSidebar } from "../roles/DeveloperSidebar";

export function Sidebar() {
  const role = useBoardStore((s) => s.role);

  return (
    <aside className="relative w-[310px] shrink-0">
      <div className="
        relative h-full rounded-2xl overflow-y-auto max-h-[calc(100vh-104px)]
        backdrop-blur-2xl
        bg-gradient-to-b from-white/[0.06] to-white/[0.02]
        border border-white/[0.1]
        shadow-[0_0_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]
        glow-border glow-border-slow
      ">
        {/* Top highlight */}
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Holographic shimmer */}
        <div className="absolute inset-0 rounded-2xl holo-shimmer pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative p-5 space-y-5"
          >
            {role === "product-owner" && <ProductOwnerSidebar />}
            {role === "scrum-master" && <ScrumMasterSidebar />}
            {role === "developer" && <DeveloperSidebar />}
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  );
}
