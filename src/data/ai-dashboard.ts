import { KanbanCard, TeamMember, CardStatus, EPICS } from "@/types";
import { cards as allCards } from "./cards";
import { team } from "./team";
import { currentSprint } from "./sprints";

export interface DashboardModule {
  id: string;
  type: string;
  reasoning: string;
  priority: number;
  data: Record<string, unknown>[];
}

export interface PersonalizedDashboard {
  developer: string;
  devId: string;
  generatedAt: string;
  signalSummary: string;
  dashboardItems: DashboardModule[];
}

function getDevCards(devId: string, boardCards: KanbanCard[]) {
  return boardCards.filter((c) => c.assignee?.id === devId);
}

function analyzeActivity(dev: TeamMember, boardCards: KanbanCard[]) {
  const myCards = getDevCards(dev.id, boardCards);
  const done = myCards.filter((c) => c.status === "done");
  const inProgress = myCards.filter((c) => c.status === "in_progress");
  const inReview = myCards.filter((c) => c.status === "review");
  const todo = myCards.filter((c) => c.status === "todo");
  const blocked = myCards.filter((c) => c.blockedReason);

  const epicActivity: Record<string, number> = {};
  myCards.forEach((c) => {
    epicActivity[c.epic] = (epicActivity[c.epic] || 0) + 1;
  });
  const primaryEpic = Object.entries(epicActivity).sort(
    (a, b) => b[1] - a[1]
  )[0];

  const labelFreq: Record<string, number> = {};
  myCards.forEach((c) =>
    c.labels.forEach((l) => {
      labelFreq[l] = (labelFreq[l] || 0) + 1;
    })
  );
  const topLabels = Object.entries(labelFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([l]) => l);

  const prCards = myCards.filter((c) => c.prLink);
  const mergedPRs = prCards.filter((c) => c.prLink?.status === "merged");
  const openPRs = prCards.filter((c) => c.prLink?.status === "open");
  const draftPRs = prCards.filter((c) => c.prLink?.status === "draft");

  const teamReviewNeeded = boardCards.filter(
    (c) => c.status === "review" && c.assignee?.id !== dev.id
  );

  const incompleteSubtasks = inProgress.filter((c) => {
    const d = c.subtasks.filter((s) => s.completed).length;
    return c.subtasks.length > 0 && d < c.subtasks.length;
  });

  const totalPoints = done.reduce((s, c) => s + c.storyPoints, 0);
  const avgPointsPerCard =
    done.length > 0 ? totalPoints / done.length : 0;

  const highPriorityActive = myCards.filter(
    (c) =>
      (c.priority === "P0" || c.priority === "P1") &&
      c.status !== "done"
  );

  return {
    dev,
    myCards,
    done,
    inProgress,
    inReview,
    todo,
    blocked,
    primaryEpic,
    epicActivity,
    topLabels,
    prCards,
    mergedPRs,
    openPRs,
    draftPRs,
    teamReviewNeeded,
    incompleteSubtasks,
    totalPoints,
    avgPointsPerCard,
    highPriorityActive,
  };
}

export function generateDashboard(
  devId: string,
  boardCards?: KanbanCard[]
): PersonalizedDashboard {
  const data = boardCards ?? allCards;
  const dev = team.find((t) => t.id === devId);
  if (!dev) {
    return {
      developer: "Unknown",
      devId,
      generatedAt: new Date().toISOString(),
      signalSummary: "No developer data available.",
      dashboardItems: [],
    };
  }

  const a = analyzeActivity(dev, data);
  const modules: DashboardModule[] = [];
  let priority = 0;

  // --- MODULE: Blocked Items (highest priority if any exist) ---
  if (a.blocked.length > 0) {
    modules.push({
      id: "blocked-items",
      type: "Blocked Items",
      reasoning: `${dev.name.split(" ")[0]} has ${a.blocked.length} blocked item${a.blocked.length > 1 ? "s" : ""}. Impediment removal is the top priority to restore flow.`,
      priority: priority++,
      data: a.blocked.map((c) => ({
        card: c.title,
        priority: c.priority,
        reason: c.blockedReason,
        storyPoints: c.storyPoints,
        daysBlocked: Math.floor(
          (Date.now() - new Date(c.movedAt.in_progress || c.createdAt).getTime()) /
            86400000
        ),
      })),
    });
  }

  // --- MODULE: Active Work in Progress ---
  if (a.inProgress.length > 0) {
    const isOverloaded = a.inProgress.length > 2;
    modules.push({
      id: "active-work",
      type: "Active Work in Progress",
      reasoning: isOverloaded
        ? `${dev.name.split(" ")[0]} has ${a.inProgress.length} items in progress — context-switching risk detected. AI recommends finishing current work before pulling new tasks.`
        : `${dev.name.split(" ")[0]} has ${a.inProgress.length} item${a.inProgress.length > 1 ? "s" : ""} actively in progress. Focused workload detected.`,
      priority: priority++,
      data: a.inProgress.map((c) => ({
        card: c.title,
        priority: c.priority,
        storyPoints: c.storyPoints,
        subtasksComplete: c.subtasks.length > 0
          ? `${c.subtasks.filter((s) => s.completed).length}/${c.subtasks.length}`
          : "N/A",
        pr: c.prLink
          ? { branch: c.prLink.branch, status: c.prLink.status }
          : null,
        epic: c.epic,
      })),
    });
  }

  // --- MODULE: Subtask Completion Needed ---
  if (a.incompleteSubtasks.length > 0) {
    modules.push({
      id: "subtask-completion",
      type: "Subtasks Requiring Attention",
      reasoning: `${a.incompleteSubtasks.length} in-progress card${a.incompleteSubtasks.length > 1 ? "s have" : " has"} unfinished subtasks. Completing these will unblock transitions to review.`,
      priority: priority++,
      data: a.incompleteSubtasks.map((c) => {
        const d = c.subtasks.filter((s) => s.completed).length;
        return {
          card: c.title,
          completed: d,
          total: c.subtasks.length,
          remaining: c.subtasks
            .filter((s) => !s.completed)
            .map((s) => s.title),
        };
      }),
    });
  }

  // --- MODULE: PRs Awaiting Review (yours) ---
  if (a.openPRs.length > 0 || a.inReview.length > 0) {
    modules.push({
      id: "your-prs",
      type: "Your PRs Awaiting Review",
      reasoning: `${dev.name.split(" ")[0]} has ${a.inReview.length} item${a.inReview.length > 1 ? "s" : ""} in code review. Follow up with reviewers to maintain momentum.`,
      priority: priority++,
      data: a.inReview.map((c) => ({
        card: c.title,
        branch: c.prLink?.branch ?? "—",
        prStatus: c.prLink?.status ?? "—",
        storyPoints: c.storyPoints,
      })),
    });
  }

  // --- MODULE: Team Review Requests ---
  if (a.teamReviewNeeded.length > 0) {
    modules.push({
      id: "team-reviews",
      type: "Team Needs Your Reviews",
      reasoning: `${a.teamReviewNeeded.length} teammate PR${a.teamReviewNeeded.length > 1 ? "s are" : " is"} waiting for review. Quick turnaround on reviews reduces team cycle time by an average of 30%.`,
      priority: priority++,
      data: a.teamReviewNeeded.map((c) => ({
        card: c.title,
        author: c.assignee?.name ?? "Unassigned",
        branch: c.prLink?.branch ?? "—",
        storyPoints: c.storyPoints,
        priority: c.priority,
      })),
    });
  }

  // --- MODULE: High Priority Items ---
  if (a.highPriorityActive.length > 0) {
    modules.push({
      id: "high-priority",
      type: "High Priority Focus",
      reasoning: `${a.highPriorityActive.length} P0/P1 item${a.highPriorityActive.length > 1 ? "s" : ""} assigned to ${dev.name.split(" ")[0]} are not yet complete. These impact release targets and should take precedence.`,
      priority: priority++,
      data: a.highPriorityActive.map((c) => ({
        card: c.title,
        priority: c.priority,
        status: c.status,
        storyPoints: c.storyPoints,
        epic: c.epic,
      })),
    });
  }

  // --- MODULE: Sprint Velocity ---
  modules.push({
    id: "velocity",
    type: "Sprint Velocity",
    reasoning: `${dev.name.split(" ")[0]} has delivered ${a.totalPoints} story points across ${a.done.length} completed items this sprint. ${a.totalPoints > 10 ? "Strong contribution." : a.totalPoints > 0 ? "Moderate pace — check for blockers." : "No completions yet — ramp-up or impediments likely."}`,
    priority: priority++,
    data: [
      {
        completedCards: a.done.length,
        totalPoints: a.totalPoints,
        avgPointsPerCard: Math.round(a.avgPointsPerCard * 10) / 10,
        sprintName: currentSprint.name,
        sprintProgress: `${Math.round((currentSprint.completedPoints / currentSprint.totalPoints) * 100)}%`,
      },
    ],
  });

  // --- MODULE: Epic Focus Area ---
  if (a.primaryEpic) {
    modules.push({
      id: "epic-focus",
      type: "Primary Epic Focus",
      reasoning: `${dev.name.split(" ")[0]}'s work is concentrated in "${a.primaryEpic[0]}" (${a.primaryEpic[1]} cards). This signals domain specialization — surfacing related items.`,
      priority: priority++,
      data: [
        {
          epic: a.primaryEpic[0],
          cardCount: a.primaryEpic[1],
          allEpics: Object.entries(a.epicActivity).map(([name, count]) => ({
            name,
            cards: count,
          })),
        },
      ],
    });
  }

  // --- MODULE: Domain Expertise ---
  if (a.topLabels.length > 0) {
    modules.push({
      id: "domain-expertise",
      type: "Domain Expertise",
      reasoning: `Historical pattern analysis shows ${dev.name.split(" ")[0]}'s top activity domains: ${a.topLabels.join(", ")}. Surfacing this for context-aware task routing.`,
      priority: priority++,
      data: [
        {
          topDomains: a.topLabels,
          totalCards: a.myCards.length,
          completionRate:
            a.myCards.length > 0
              ? `${Math.round((a.done.length / a.myCards.length) * 100)}%`
              : "0%",
        },
      ],
    });
  }

  // --- MODULE: Upcoming Queue ---
  if (a.todo.length > 0) {
    modules.push({
      id: "upcoming-queue",
      type: "Upcoming Queue",
      reasoning: `${a.todo.length} item${a.todo.length > 1 ? "s" : ""} assigned to ${dev.name.split(" ")[0]} in To Do. AI has sorted by priority and value score to suggest next pick-up order.`,
      priority: priority++,
      data: a.todo
        .sort((x, y) => {
          const po = ["P0", "P1", "P2", "P3"];
          const d = po.indexOf(x.priority) - po.indexOf(y.priority);
          return d !== 0 ? d : y.valueScore - x.valueScore;
        })
        .map((c) => ({
          card: c.title,
          priority: c.priority,
          valueScore: c.valueScore,
          storyPoints: c.storyPoints,
          epic: c.epic,
        })),
    });
  }

  // --- MODULE: PR Activity Summary ---
  if (a.prCards.length > 0) {
    modules.push({
      id: "pr-activity",
      type: "PR Activity Summary",
      reasoning: `${dev.name.split(" ")[0]} has ${a.mergedPRs.length} merged, ${a.openPRs.length} open, and ${a.draftPRs.length} draft PRs. ${a.mergedPRs.length > a.openPRs.length ? "Good merge rate." : "Open PRs accumulating — follow up on reviews."}`,
      priority: priority++,
      data: [
        {
          merged: a.mergedPRs.length,
          open: a.openPRs.length,
          draft: a.draftPRs.length,
          branches: a.prCards.map((c) => ({
            branch: c.prLink?.branch,
            status: c.prLink?.status,
            card: c.title,
          })),
        },
      ],
    });
  }

  const signalParts: string[] = [];
  if (a.blocked.length > 0) signalParts.push(`${a.blocked.length} blocked`);
  if (a.inProgress.length > 2) signalParts.push("high WIP detected");
  if (a.teamReviewNeeded.length > 0)
    signalParts.push(`${a.teamReviewNeeded.length} reviews pending`);
  if (a.totalPoints > 10) signalParts.push("strong velocity");
  if (a.primaryEpic)
    signalParts.push(`focused on ${a.primaryEpic[0].split(" ").slice(0, 2).join(" ")}`);

  return {
    developer: dev.name,
    devId: dev.id,
    generatedAt: new Date().toISOString(),
    signalSummary:
      signalParts.length > 0
        ? `Key signals: ${signalParts.join(" · ")}`
        : `No anomalies detected for ${dev.name.split(" ")[0]}.`,
    dashboardItems: modules.sort((a, b) => a.priority - b.priority),
  };
}
