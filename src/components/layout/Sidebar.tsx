"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useBoardStore } from "@/store";
import { ProductOwnerSidebar } from "../roles/ProductOwnerSidebar";
import { ScrumMasterSidebar } from "../roles/ScrumMasterSidebar";
import { DeveloperSidebar } from "../roles/DeveloperSidebar";

export function Sidebar() {
  const role = useBoardStore((s) => s.role);

  return (
    <aside className="relative w-[300px] shrink-0">
      {/* Animated gradient left edge */}
      <div className="absolute left-0 top-4 bottom-4 w-[1px] overflow-hidden">
        <motion.div
          className="absolute w-full"
          style={{
            height: "50%",
            background: "linear-gradient(180deg, transparent, rgba(45,212,191,0.5), rgba(167,139,250,0.3), transparent)",
          }}
          animate={{ top: ["-50%", "100%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="
        h-full rounded-xl overflow-y-auto max-h-[calc(100vh-96px)]
        backdrop-blur-2xl bg-white/[0.04] border border-white/[0.1]
        shadow-[0_0_30px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]
        glass-shimmer relative
      ">
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="p-4 space-y-4"
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
