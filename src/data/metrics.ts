import { cards } from "./cards";
import { team } from "./team";
import { currentSprint } from "./sprints";
import { CardStatus, EPICS } from "@/types";

export function getReleaseProgress() {
  const total = cards.length;
  const done = cards.filter((c) => c.status === "done").length;
  return { total, done, percentage: Math.round((done / total) * 100) };
}

export function getCardsByStatus() {
  const grouped: Record<CardStatus, typeof cards> = {
    backlog: [],
    todo: [],
    in_progress: [],
    review: [],
    done: [],
  };
  for (const card of cards) {
    grouped[card.status].push(card);
  }
  return grouped;
}

export function getPriorityDistribution() {
  const dist = { P0: 0, P1: 0, P2: 0, P3: 0 };
  for (const card of cards) {
    dist[card.priority]++;
  }
  return dist;
}

export function getEpicProgress() {
  return EPICS.map((epic) => {
    const epicCards = cards.filter((c) => c.epic === epic);
    const done = epicCards.filter((c) => c.status === "done").length;
    return {
      name: epic,
      total: epicCards.length,
      done,
      percentage: epicCards.length > 0 ? Math.round((done / epicCards.length) * 100) : 0,
    };
  });
}

export function getTeamWorkload() {
  const devs = team.filter((t) => t.role === "developer");
  return devs.map((member) => {
    const memberCards = cards.filter(
      (c) => c.assignee?.id === member.id && c.status !== "done"
    );
    return {
      member,
      taskCount: memberCards.length,
      totalPoints: memberCards.reduce((sum, c) => sum + c.storyPoints, 0),
      byStatus: {
        todo: memberCards.filter((c) => c.status === "todo").length,
        in_progress: memberCards.filter((c) => c.status === "in_progress").length,
        review: memberCards.filter((c) => c.status === "review").length,
      },
    };
  });
}

export function getBlockedCards() {
  return cards.filter((c) => c.blockedReason !== null);
}

export function getSprintHealth() {
  const daysTotal = 14;
  const daysElapsed = 10;
  const progress = currentSprint.completedPoints / currentSprint.totalPoints;
  const timeProgress = daysElapsed / daysTotal;
  const onTrack = progress >= timeProgress * 0.8;
  return { progress, timeProgress, onTrack, daysRemaining: daysTotal - daysElapsed };
}

export function getPersonalStats(memberId: string) {
  const memberCards = cards.filter((c) => c.assignee?.id === memberId);
  const completed = memberCards.filter((c) => c.status === "done");
  const inProgress = memberCards.filter(
    (c) => c.status === "in_progress" || c.status === "review"
  );
  const reviewRequests = cards.filter(
    (c) => c.status === "review" && c.assignee?.id !== memberId
  );
  return {
    totalAssigned: memberCards.length,
    completed: completed.length,
    completedPoints: completed.reduce((s, c) => s + c.storyPoints, 0),
    inProgress: inProgress.length,
    reviewRequests: reviewRequests.length,
  };
}
