export type Role = "product-owner" | "scrum-master" | "developer";

export type CardStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "review"
  | "done";

export type Priority = "P0" | "P1" | "P2" | "P3";

export type PRStatus = "draft" | "open" | "merged" | "closed";

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: Role;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface PRLink {
  branch: string;
  status: PRStatus;
  url: string;
}

export interface KanbanCard {
  id: string;
  title: string;
  description: string;
  status: CardStatus;
  priority: Priority;
  assignee: TeamMember | null;
  epic: string;
  storyPoints: number;
  valueScore: number;
  subtasks: Subtask[];
  prLink: PRLink | null;
  blockedReason: string | null;
  createdAt: string;
  movedAt: Record<string, string>;
  labels: string[];
}

export interface Sprint {
  id: string;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  totalPoints: number;
  completedPoints: number;
}

export interface BurndownPoint {
  day: number;
  ideal: number;
  actual: number;
}

export interface CFDPoint {
  day: string;
  backlog: number;
  todo: number;
  in_progress: number;
  review: number;
  done: number;
}

export interface VelocityPoint {
  sprint: string;
  points: number;
}

export const COLUMN_ORDER: CardStatus[] = [
  "backlog",
  "todo",
  "in_progress",
  "review",
  "done",
];

export const COLUMN_LABELS: Record<CardStatus, string> = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

export const WIP_LIMITS: Record<CardStatus, number> = {
  backlog: 20,
  todo: 8,
  in_progress: 5,
  review: 4,
  done: 30,
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  P0: "#EF4444",
  P1: "#F59E0B",
  P2: "#3B82F6",
  P3: "#6B7280",
};

export const EPICS = [
  "User Authentication",
  "Dashboard Analytics",
  "Payment Integration",
  "Mobile Responsive",
];
