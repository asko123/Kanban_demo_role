import { Sprint, BurndownPoint, VelocityPoint, CFDPoint } from "@/types";

function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

export const currentSprint: Sprint = {
  id: "sprint-7",
  name: "Sprint 7",
  goal: "Complete payment integration and analytics MVP",
  startDate: daysFromNow(-10),
  endDate: daysFromNow(4),
  totalPoints: 68,
  completedPoints: 31,
};

export const burndownData: BurndownPoint[] = [
  { day: 0, ideal: 68, actual: 68 },
  { day: 1, ideal: 63.2, actual: 65 },
  { day: 2, ideal: 58.4, actual: 60 },
  { day: 3, ideal: 53.6, actual: 55 },
  { day: 4, ideal: 48.8, actual: 50 },
  { day: 5, ideal: 44, actual: 47 },
  { day: 6, ideal: 39.2, actual: 42 },
  { day: 7, ideal: 34.4, actual: 39 },
  { day: 8, ideal: 29.6, actual: 37 },
  { day: 9, ideal: 24.8, actual: 35 },
  { day: 10, ideal: 20, actual: 31 },
];

export const velocityHistory: VelocityPoint[] = [
  { sprint: "S1", points: 21 },
  { sprint: "S2", points: 28 },
  { sprint: "S3", points: 34 },
  { sprint: "S4", points: 31 },
  { sprint: "S5", points: 38 },
  { sprint: "S6", points: 42 },
  { sprint: "S7", points: 31 },
];

export const cfdData: CFDPoint[] = Array.from({ length: 14 }, (_, i) => ({
  day: `Day ${i + 1}`,
  backlog: Math.max(10 - Math.floor(i / 2), 4),
  todo: 4 + Math.floor(Math.sin(i * 0.5) * 2),
  in_progress: 3 + Math.floor(Math.sin(i * 0.7) * 1.5),
  review: 2 + Math.floor(Math.sin(i * 0.3) * 1),
  done: Math.min(i * 2, 12),
}));
