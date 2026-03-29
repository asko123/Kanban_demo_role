import { Role, KanbanCard } from "@/types";
import { cards } from "./cards";
import { team } from "./team";
import { currentSprint } from "./sprints";

export interface Insight {
  id: string;
  type: "warning" | "suggestion" | "positive" | "risk";
  title: string;
  body: string;
  metric?: string;
}

function analyzeForProductOwner(boardCards: KanbanCard[]): Insight[] {
  const insights: Insight[] = [];

  const p0Cards = boardCards.filter((c) => c.priority === "P0" && c.status !== "done");
  if (p0Cards.length > 0) {
    const blocked = p0Cards.filter((c) => c.blockedReason);
    if (blocked.length > 0) {
      insights.push({
        id: "po-p0-blocked",
        type: "risk",
        title: "Critical items at risk",
        body: `${blocked.length} P0 item${blocked.length > 1 ? "s are" : " is"} blocked. "${blocked[0].title}" is waiting on an external dependency. Consider escalating to unblock the roadmap.`,
        metric: `${blocked.length} blocked P0s`,
      });
    }
    insights.push({
      id: "po-p0-open",
      type: "warning",
      title: "High-priority items still open",
      body: `${p0Cards.length} P0 items remain in the pipeline. Focus the team on completing "${p0Cards[0].title}" before pulling new work to protect release targets.`,
      metric: `${p0Cards.length} P0 open`,
    });
  }

  const backlogCards = boardCards.filter((c) => c.status === "backlog");
  const totalCards = boardCards.length;
  const backlogRatio = backlogCards.length / totalCards;
  if (backlogRatio > 0.3) {
    insights.push({
      id: "po-backlog-heavy",
      type: "suggestion",
      title: "Backlog is growing",
      body: `${Math.round(backlogRatio * 100)}% of all items sit in the backlog. Consider a grooming session to prioritize or archive stale items. Overgrown backlogs slow sprint planning.`,
      metric: `${backlogCards.length}/${totalCards} in backlog`,
    });
  }

  const doneCards = boardCards.filter((c) => c.status === "done");
  const avgValue = doneCards.length > 0
    ? doneCards.reduce((s, c) => s + c.valueScore, 0) / doneCards.length
    : 0;
  if (avgValue > 7) {
    insights.push({
      id: "po-value-delivery",
      type: "positive",
      title: "Delivering high-value work",
      body: `Completed items average a value score of ${avgValue.toFixed(1)}/10. The team is prioritizing impactful work well. Keep this momentum through the release.`,
      metric: `Avg value: ${avgValue.toFixed(1)}`,
    });
  }

  const unassigned = boardCards.filter((c) => !c.assignee && c.status === "todo");
  if (unassigned.length >= 3) {
    insights.push({
      id: "po-unassigned",
      type: "suggestion",
      title: "Unassigned items in To Do",
      body: `${unassigned.length} "To Do" items have no owner. Assign them in the next standup to prevent drift and ensure accountability.`,
      metric: `${unassigned.length} unassigned`,
    });
  }

  return insights;
}

function analyzeForScrumMaster(boardCards: KanbanCard[]): Insight[] {
  const insights: Insight[] = [];

  const inProgress = boardCards.filter((c) => c.status === "in_progress");
  if (inProgress.length > 5) {
    insights.push({
      id: "sm-wip-violation",
      type: "warning",
      title: "WIP limit exceeded",
      body: `"In Progress" has ${inProgress.length} items (limit: 5). High WIP correlates with longer cycle times. Encourage the team to finish current work before starting new tasks.`,
      metric: `${inProgress.length}/5 WIP`,
    });
  }

  const blockedCards = boardCards.filter((c) => c.blockedReason);
  if (blockedCards.length > 0) {
    insights.push({
      id: "sm-blockers",
      type: "risk",
      title: `${blockedCards.length} item${blockedCards.length > 1 ? "s" : ""} blocked`,
      body: `"${blockedCards[0].title}" has been blocked due to: ${blockedCards[0].blockedReason}. Blocked items increase cycle time by 2-3x on average. Prioritize impediment removal.`,
      metric: `${blockedCards.length} blockers`,
    });
  }

  const devMembers = team.filter((t) => t.role === "developer");
  const loads = devMembers.map((m) => ({
    name: m.name.split(" ")[0],
    count: boardCards.filter(
      (c) => c.assignee?.id === m.id && c.status !== "done"
    ).length,
  }));
  const max = Math.max(...loads.map((l) => l.count));
  const min = Math.min(...loads.map((l) => l.count));
  if (max - min >= 3) {
    const overloaded = loads.find((l) => l.count === max);
    const underloaded = loads.find((l) => l.count === min);
    insights.push({
      id: "sm-workload-imbalance",
      type: "suggestion",
      title: "Workload imbalance detected",
      body: `${overloaded?.name} has ${max} active tasks while ${underloaded?.name} has ${min}. Consider redistributing work to maintain sustainable pace and reduce burnout risk.`,
      metric: `${max} vs ${min} tasks`,
    });
  }

  const progress = currentSprint.completedPoints / currentSprint.totalPoints;
  if (progress < 0.5) {
    insights.push({
      id: "sm-sprint-behind",
      type: "warning",
      title: "Sprint may be at risk",
      body: `Only ${Math.round(progress * 100)}% of sprint points are complete with 4 days remaining. Review the sprint goal and consider descoping lower-priority items to protect the commitment.`,
      metric: `${Math.round(progress * 100)}% done`,
    });
  } else {
    insights.push({
      id: "sm-sprint-health",
      type: "positive",
      title: "Sprint is tracking well",
      body: `${Math.round(progress * 100)}% of committed points are done. The team is on pace to meet the sprint goal. Continue daily syncs to maintain momentum.`,
      metric: `${Math.round(progress * 100)}% complete`,
    });
  }

  return insights;
}

function analyzeForDeveloper(boardCards: KanbanCard[], devId?: string): Insight[] {
  const insights: Insight[] = [];
  const myId = devId ?? "tm-1";
  const myCards = boardCards.filter((c) => c.assignee?.id === myId);
  const myInProgress = myCards.filter((c) => c.status === "in_progress");
  const myReview = myCards.filter((c) => c.status === "review");
  const myDone = myCards.filter((c) => c.status === "done");

  if (myInProgress.length > 2) {
    insights.push({
      id: "dev-too-many-wip",
      type: "warning",
      title: "Too many items in flight",
      body: `You have ${myInProgress.length} tasks in progress. Research shows context-switching between 3+ tasks reduces productivity by 40%. Try finishing "${myInProgress[0].title}" before starting new work.`,
      metric: `${myInProgress.length} in progress`,
    });
  }

  if (myReview.length > 0) {
    insights.push({
      id: "dev-pr-pending",
      type: "suggestion",
      title: "PRs awaiting review",
      body: `${myReview.length} of your item${myReview.length > 1 ? "s are" : " is"} in code review. Follow up with reviewers to unblock "${myReview[0].title}" and keep your flow moving.`,
      metric: `${myReview.length} in review`,
    });
  }

  const reviewRequests = boardCards.filter(
    (c) => c.status === "review" && c.assignee?.id !== myId
  );
  if (reviewRequests.length > 0) {
    insights.push({
      id: "dev-review-requests",
      type: "suggestion",
      title: "Team needs your reviews",
      body: `${reviewRequests.length} item${reviewRequests.length > 1 ? "s" : ""} from teammates ${reviewRequests.length > 1 ? "are" : "is"} waiting for code review. Quick reviews help the whole team's cycle time. Consider reviewing "${reviewRequests[0].title}" first.`,
      metric: `${reviewRequests.length} reviews pending`,
    });
  }

  if (myDone.length > 0) {
    const totalPoints = myDone.reduce((s, c) => s + c.storyPoints, 0);
    insights.push({
      id: "dev-velocity",
      type: "positive",
      title: "Strong sprint contribution",
      body: `You've completed ${myDone.length} items (${totalPoints} points) this sprint. That's solid output. Keep the momentum going!`,
      metric: `${totalPoints} pts delivered`,
    });
  }

  const incompleteSubtasks = myInProgress.filter((c) => {
    const done = c.subtasks.filter((s) => s.completed).length;
    return c.subtasks.length > 0 && done < c.subtasks.length;
  });
  if (incompleteSubtasks.length > 0) {
    const card = incompleteSubtasks[0];
    const done = card.subtasks.filter((s) => s.completed).length;
    insights.push({
      id: "dev-subtask-progress",
      type: "suggestion",
      title: "Subtasks to finish",
      body: `"${card.title}" has ${done}/${card.subtasks.length} subtasks complete. Knock out the remaining ones to move it to review.`,
      metric: `${done}/${card.subtasks.length} done`,
    });
  }

  return insights;
}

export function getInsightsForRole(role: Role, boardCards?: KanbanCard[], devId?: string): Insight[] {
  const data = boardCards ?? cards;
  switch (role) {
    case "product-owner":
      return analyzeForProductOwner(data);
    case "scrum-master":
      return analyzeForScrumMaster(data);
    case "developer":
      return analyzeForDeveloper(data, devId);
  }
}
