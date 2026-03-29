"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useBoardStore } from "@/store";
import { ProductOwnerSidebar } from "../roles/ProductOwnerSidebar";
import { ScrumMasterSidebar } from "../roles/ScrumMasterSidebar";
import { DeveloperSidebar } from "../roles/DeveloperSidebar";

export function Sidebar() {
  const role = useBoardStore((s) => s.role);

  return (
    <aside className="w-[300px] shrink-0 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl overflow-y-auto max-h-[calc(100vh-96px)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={role}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
          className="p-4 space-y-4"
        >
          {role === "product-owner" && <ProductOwnerSidebar />}
          {role === "scrum-master" && <ScrumMasterSidebar />}
          {role === "developer" && <DeveloperSidebar />}
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}
