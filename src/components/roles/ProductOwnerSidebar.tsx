"use client";

import { TrendingUp, Target, Layers, BarChart3 } from "lucide-react";
import { useBoardStore } from "@/store";
import { getReleaseProgress, getEpicProgress, getPriorityDistribution } from "@/data/metrics";
import { EPICS, PRIORITY_COLORS } from "@/types";
import { VelocityChart } from "../charts/VelocityChart";
import { AIInsightsPanel } from "./AIInsightsPanel";

function SidebarSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof TrendingUp;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-teal-400" />
        <h3 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

export function ProductOwnerSidebar() {
  const epicFilter = useBoardStore((s) => s.epicFilter);
  const setEpicFilter = useBoardStore((s) => s.setEpicFilter);
  const release = getReleaseProgress();
  const epics = getEpicProgress();
  const priorities = getPriorityDistribution();

  return (
    <>
      {/* Release Progress */}
      <SidebarSection title="Release Progress" icon={Target}>
        <div className="relative h-6 rounded-full bg-white/[0.04] border border-white/[0.08] overflow-hidden backdrop-blur-sm">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal-500/30 to-teal-400/20"
            style={{ width: `${release.percentage}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-slate-300">
              {release.percentage}% — {release.done}/{release.total} items
            </span>
          </div>
        </div>
      </SidebarSection>

      {/* Priority Distribution */}
      <SidebarSection title="Priority Breakdown" icon={BarChart3}>
        <div className="grid grid-cols-4 gap-1.5">
          {(Object.entries(priorities) as [string, number][]).map(
            ([priority, count]) => (
              <div
                key={priority}
                className="flex flex-col items-center gap-1 p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS],
                  }}
                />
                <span className="text-xs font-bold text-slate-300">
                  {count}
                </span>
                <span className="text-[9px] text-slate-500">{priority}</span>
              </div>
            )
          )}
        </div>
      </SidebarSection>

      {/* Epic Swimlanes */}
      <SidebarSection title="Epic Progress" icon={Layers}>
        <div className="space-y-2">
          {epics.map((epic) => (
            <button
              key={epic.name}
              onClick={() =>
                setEpicFilter(epicFilter === epic.name ? null : epic.name)
              }
              className={`w-full text-left p-2 rounded-lg border transition-all ${
                epicFilter === epic.name
                  ? "bg-teal-500/10 border-teal-500/20"
                  : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-300 font-medium truncate pr-2">
                  {epic.name}
                </span>
                <span className="text-[10px] text-slate-500">
                  {epic.done}/{epic.total}
                </span>
              </div>
              <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full bg-teal-500/40"
                  style={{ width: `${epic.percentage}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </SidebarSection>

      {/* AI Insights */}
      <AIInsightsPanel />

      {/* Velocity Trend */}
      <SidebarSection title="Velocity Trend" icon={TrendingUp}>
        <VelocityChart />
      </SidebarSection>
    </>
  );
}
