"use client";

import {
  Activity,
  AlertTriangle,
  Users,
  Timer,
  BarChart3,
} from "lucide-react";
import { useBoardStore } from "@/store";
import {
  getTeamWorkload,
  getBlockedCards,
  getSprintHealth,
} from "@/data/metrics";
import { currentSprint } from "@/data/sprints";
import { BurndownChart } from "../charts/BurndownChart";
import { CFDChart } from "../charts/CFDChart";

function SidebarSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Activity;
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

export function ScrumMasterSidebar() {
  const toggleBlocker = useBoardStore((s) => s.toggleBlocker);
  const health = getSprintHealth();
  const workload = getTeamWorkload();
  const blockedCards = getBlockedCards();

  return (
    <>
      {/* Sprint Health */}
      <SidebarSection title={currentSprint.name} icon={Activity}>
        <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] space-y-2">
          <p className="text-[11px] text-slate-400 italic">
            &ldquo;{currentSprint.goal}&rdquo;
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Progress</span>
            <span
              className={`text-xs font-bold ${
                health.onTrack ? "text-teal-400" : "text-amber-400"
              }`}
            >
              {Math.round(health.progress * 100)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full rounded-full ${
                health.onTrack
                  ? "bg-teal-500/50"
                  : "bg-amber-500/50"
              }`}
              style={{ width: `${health.progress * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500">
            {health.daysRemaining} days remaining &middot;{" "}
            {currentSprint.completedPoints}/{currentSprint.totalPoints} pts
          </p>
        </div>
      </SidebarSection>

      {/* Burndown */}
      <SidebarSection title="Sprint Burndown" icon={Timer}>
        <BurndownChart />
      </SidebarSection>

      {/* Blocked Items */}
      <SidebarSection title={`Blockers (${blockedCards.length})`} icon={AlertTriangle}>
        {blockedCards.length === 0 ? (
          <p className="text-[11px] text-slate-500 italic">No blocked items</p>
        ) : (
          <div className="space-y-1.5">
            {blockedCards.map((card) => (
              <div
                key={card.id}
                className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 flex items-start justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-300 truncate">
                    {card.title}
                  </p>
                  <p className="text-[10px] text-red-400 truncate">
                    {card.blockedReason}
                  </p>
                </div>
                <button
                  onClick={() => toggleBlocker(card.id, null)}
                  className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 shrink-0"
                >
                  Clear
                </button>
              </div>
            ))}
          </div>
        )}
      </SidebarSection>

      {/* Team Workload */}
      <SidebarSection title="Team Workload" icon={Users}>
        <div className="space-y-2">
          {workload.map(({ member, totalPoints, byStatus }) => (
            <div
              key={member.id}
              className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-500/30 to-violet-500/30 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-slate-300">
                      {member.avatar}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-300">
                    {member.name.split(" ")[0]}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {totalPoints}sp
                </span>
              </div>
              <div className="flex h-1.5 rounded-full overflow-hidden bg-white/[0.04]">
                {byStatus.todo > 0 && (
                  <div
                    className="bg-amber-500/40"
                    style={{
                      width: `${(byStatus.todo / (byStatus.todo + byStatus.in_progress + byStatus.review || 1)) * 100}%`,
                    }}
                  />
                )}
                {byStatus.in_progress > 0 && (
                  <div
                    className="bg-blue-500/40"
                    style={{
                      width: `${(byStatus.in_progress / (byStatus.todo + byStatus.in_progress + byStatus.review || 1)) * 100}%`,
                    }}
                  />
                )}
                {byStatus.review > 0 && (
                  <div
                    className="bg-violet-500/40"
                    style={{
                      width: `${(byStatus.review / (byStatus.todo + byStatus.in_progress + byStatus.review || 1)) * 100}%`,
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </SidebarSection>

      {/* CFD */}
      <SidebarSection title="Cumulative Flow" icon={BarChart3}>
        <CFDChart />
      </SidebarSection>
    </>
  );
}
