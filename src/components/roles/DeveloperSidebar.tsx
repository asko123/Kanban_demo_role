"use client";

import {
  User,
  GitPullRequest,
  Zap,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { useBoardStore } from "@/store";
import { getPersonalStats } from "@/data/metrics";
import { currentDeveloper } from "@/data/team";
import { AIInsightsPanel } from "./AIInsightsPanel";

function SidebarSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof User;
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

export function DeveloperSidebar() {
  const myTasksFilter = useBoardStore((s) => s.myTasksFilter);
  const setMyTasksFilter = useBoardStore((s) => s.setMyTasksFilter);
  const cards = useBoardStore((s) => s.cards);
  const stats = getPersonalStats(currentDeveloper.id);

  const reviewCards = cards.filter(
    (c) => c.status === "review" && c.assignee?.id !== currentDeveloper.id
  );

  return (
    <>
      {/* My Profile */}
      <SidebarSection title="Your Profile" icon={User}>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500/40 to-violet-500/40 flex items-center justify-center">
            <span className="text-sm font-bold text-slate-200">
              {currentDeveloper.avatar}
            </span>
          </div>
          <div>
            <p className="text-sm text-slate-200 font-medium">
              {currentDeveloper.name}
            </p>
            <p className="text-[10px] text-slate-500">Developer</p>
          </div>
        </div>
      </SidebarSection>

      {/* My Tasks Filter */}
      <SidebarSection title="Task Filter" icon={Filter}>
        <button
          data-testid="my-tasks-toggle"
          onClick={() => setMyTasksFilter(!myTasksFilter)}
          className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all ${
            myTasksFilter
              ? "bg-teal-500/10 border-teal-500/20 text-teal-400"
              : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:bg-white/[0.04]"
          }`}
        >
          <span className="text-[11px] font-medium">Show only my tasks</span>
          <div
            className={`w-8 h-4 rounded-full transition-colors ${
              myTasksFilter ? "bg-teal-500/30" : "bg-white/[0.08]"
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full mt-0.5 transition-all ${
                myTasksFilter
                  ? "bg-teal-400 ml-[18px]"
                  : "bg-slate-500 ml-0.5"
              }`}
            />
          </div>
        </button>
      </SidebarSection>

      {/* Personal Velocity */}
      <SidebarSection title="Sprint Stats" icon={Zap}>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
            <p className="text-lg font-bold text-teal-400">
              {stats.completed}
            </p>
            <p className="text-[9px] text-slate-500 uppercase">Completed</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
            <p className="text-lg font-bold text-violet-400">
              {stats.completedPoints}
            </p>
            <p className="text-[9px] text-slate-500 uppercase">Points</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
            <p className="text-lg font-bold text-blue-400">
              {stats.inProgress}
            </p>
            <p className="text-[9px] text-slate-500 uppercase">In Flight</p>
          </div>
          <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-center">
            <p className="text-lg font-bold text-slate-300">
              {stats.totalAssigned}
            </p>
            <p className="text-[9px] text-slate-500 uppercase">Total</p>
          </div>
        </div>
      </SidebarSection>

      {/* AI Insights */}
      <AIInsightsPanel />

      {/* Code Review Requests */}
      <SidebarSection
        title={`Review Requests (${reviewCards.length})`}
        icon={GitPullRequest}
      >
        {reviewCards.length === 0 ? (
          <p className="text-[11px] text-slate-500 italic">
            No pending reviews
          </p>
        ) : (
          <div className="space-y-1.5">
            {reviewCards.map((card) => (
              <div
                key={card.id}
                className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors"
              >
                <p className="text-[11px] text-slate-300 truncate">
                  {card.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {card.prLink && (
                    <span className="text-[9px] text-slate-500 font-mono truncate">
                      {card.prLink.branch}
                    </span>
                  )}
                  {card.assignee && (
                    <span className="text-[9px] text-slate-500">
                      by {card.assignee.name.split(" ")[0]}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </SidebarSection>

      {/* Subtask Summary */}
      <SidebarSection title="Subtask Progress" icon={CheckCircle2}>
        {(() => {
          const myCards = cards.filter(
            (c) =>
              c.assignee?.id === currentDeveloper.id &&
              c.subtasks.length > 0 &&
              c.status !== "done"
          );
          if (myCards.length === 0)
            return (
              <p className="text-[11px] text-slate-500 italic">
                No active subtasks
              </p>
            );
          return (
            <div className="space-y-1.5">
              {myCards.map((card) => {
                const done = card.subtasks.filter((s) => s.completed).length;
                const total = card.subtasks.length;
                return (
                  <div
                    key={card.id}
                    className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]"
                  >
                    <p className="text-[11px] text-slate-300 truncate mb-1">
                      {card.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-teal-500/40"
                          style={{
                            width: `${(done / total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono shrink-0">
                        {done}/{total}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </SidebarSection>
    </>
  );
}
