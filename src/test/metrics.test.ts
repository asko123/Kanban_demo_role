import { describe, it, expect } from "vitest";
import {
  getReleaseProgress,
  getCardsByStatus,
  getPriorityDistribution,
  getEpicProgress,
  getTeamWorkload,
  getBlockedCards,
  getSprintHealth,
  getPersonalStats,
} from "@/data/metrics";

describe("metrics", () => {
  it("getReleaseProgress returns valid percentages", () => {
    const result = getReleaseProgress();
    expect(result.total).toBeGreaterThan(0);
    expect(result.done).toBeGreaterThanOrEqual(0);
    expect(result.percentage).toBeGreaterThanOrEqual(0);
    expect(result.percentage).toBeLessThanOrEqual(100);
  });

  it("getCardsByStatus groups all cards", () => {
    const grouped = getCardsByStatus();
    const total = Object.values(grouped).reduce(
      (sum, arr) => sum + arr.length,
      0
    );
    expect(total).toBe(24);
    expect(grouped.backlog.length).toBeGreaterThan(0);
    expect(grouped.done.length).toBeGreaterThan(0);
  });

  it("getPriorityDistribution covers all priorities", () => {
    const dist = getPriorityDistribution();
    expect(dist.P0).toBeGreaterThan(0);
    expect(dist.P1).toBeGreaterThan(0);
    expect(dist.P2).toBeGreaterThan(0);
    expect(dist.P3).toBeGreaterThan(0);
  });

  it("getEpicProgress returns data for all epics", () => {
    const epics = getEpicProgress();
    expect(epics.length).toBe(4);
    epics.forEach((epic) => {
      expect(epic.total).toBeGreaterThan(0);
      expect(epic.percentage).toBeGreaterThanOrEqual(0);
      expect(epic.percentage).toBeLessThanOrEqual(100);
    });
  });

  it("getTeamWorkload returns developer workloads", () => {
    const workload = getTeamWorkload();
    expect(workload.length).toBe(4);
    workload.forEach((w) => {
      expect(w.member.role).toBe("developer");
      expect(w.taskCount).toBeGreaterThanOrEqual(0);
    });
  });

  it("getBlockedCards finds blocked items", () => {
    const blocked = getBlockedCards();
    expect(blocked.length).toBeGreaterThan(0);
    blocked.forEach((card) => {
      expect(card.blockedReason).not.toBeNull();
    });
  });

  it("getSprintHealth returns health status", () => {
    const health = getSprintHealth();
    expect(health.progress).toBeGreaterThanOrEqual(0);
    expect(health.progress).toBeLessThanOrEqual(1);
    expect(health.daysRemaining).toBeGreaterThanOrEqual(0);
    expect(typeof health.onTrack).toBe("boolean");
  });

  it("getPersonalStats returns stats for a developer", () => {
    const stats = getPersonalStats("tm-1");
    expect(stats.totalAssigned).toBeGreaterThan(0);
    expect(stats.completed).toBeGreaterThanOrEqual(0);
    expect(stats.completedPoints).toBeGreaterThanOrEqual(0);
  });

  it("getPersonalStats returns zeros for unknown member", () => {
    const stats = getPersonalStats("nonexistent");
    expect(stats.totalAssigned).toBe(0);
    expect(stats.completed).toBe(0);
  });
});
