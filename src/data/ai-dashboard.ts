import { KanbanCard, TeamMember, EPICS } from "@/types";
import { cards as allCards } from "./cards";
import { team } from "./team";
import { currentSprint } from "./sprints";

export interface AIAction { action: string; reason: string; impact: "critical" | "high" | "medium" | "low"; }
export interface AIRisk { title: string; description: string; severity: "critical" | "warning" | "info"; metric: string; }
export interface AIPattern { label: string; value: string; trend: "up" | "down" | "stable"; context: string; }
export interface AINarrative { id: string; category: "focus" | "blocker" | "opportunity" | "momentum" | "collaboration" | "recommendation"; headline: string; narrative: string; aiConfidence: number; details?: { label: string; value: string; color?: string }[]; }
export interface PersonalizedDashboard { developer: string; devId: string; greeting: string; topAction: AIAction; riskAssessment: { score: number; label: string; risks: AIRisk[] }; patterns: AIPattern[]; narratives: AINarrative[]; sprintContext: { name: string; daysLeft: number; progress: number; myContribution: number; teamTotal: number }; }

function daysFromNow(d: string): number { return Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86400000)); }
function daysBetween(d1: string, d2: string): number { return Math.max(0, Math.floor((new Date(d2).getTime() - new Date(d1).getTime()) / 86400000)); }

export function generateDashboard(devId: string, boardCards?: KanbanCard[]): PersonalizedDashboard {
  const data = boardCards ?? allCards;
  const dev = team.find((t) => t.id === devId);
  if (!dev) return emptyDashboard(devId);
  const name = dev.name.split(" ")[0];
  const my = data.filter((c) => c.assignee?.id === devId);
  const myDone = my.filter((c) => c.status === "done");
  const myWip = my.filter((c) => c.status === "in_progress");
  const myReview = my.filter((c) => c.status === "review");
  const myTodo = my.filter((c) => c.status === "todo");
  const myBlocked = my.filter((c) => c.blockedReason);
  const teamReviews = data.filter((c) => c.status === "review" && c.assignee?.id !== devId);
  const totalPts = myDone.reduce((s, c) => s + c.storyPoints, 0);
  const wipPts = myWip.reduce((s, c) => s + c.storyPoints, 0);
  const epicCounts: Record<string, number> = {};
  my.forEach((c) => { epicCounts[c.epic] = (epicCounts[c.epic] || 0) + 1; });
  const topEpic = Object.entries(epicCounts).sort((a, b) => b[1] - a[1])[0];
  const labelCounts: Record<string, number> = {};
  my.forEach((c) => c.labels.forEach((l) => { labelCounts[l] = (labelCounts[l] || 0) + 1; }));
  const topLabels = Object.entries(labelCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  const highPri = my.filter((c) => (c.priority === "P0" || c.priority === "P1") && c.status !== "done");

  const hour = new Date().getHours();
  const tod = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  let gCtx = "";
  if (myBlocked.length > 0) gCtx = "There's a blocker that needs your attention.";
  else if (myWip.length > 2) gCtx = `You're juggling ${myWip.length} items — let's focus.`;
  else if (teamReviews.length > 2) gCtx = `${teamReviews.length} teammates are waiting on code reviews.`;
  else if (myDone.length > 0) gCtx = `You've shipped ${totalPts} points so far this sprint. Keep it up.`;
  else gCtx = "Let's get some work across the finish line today.";

  let topAction: AIAction;
  if (myBlocked.length > 0) { const b = myBlocked[0]; topAction = { action: `Escalate blocker on "${b.title}"`, reason: `Blocked ${daysFromNow(b.movedAt.in_progress || b.createdAt)}d: "${b.blockedReason}". Each blocked day adds ~1.5x to cycle time.`, impact: "critical" };
  } else if (myWip.length > 0) { const inc = myWip.filter((c) => c.subtasks.length > 0 && c.subtasks.some((s) => !s.completed));
    if (inc.length > 0) { const c = inc[0], done = c.subtasks.filter((s) => s.completed).length; topAction = { action: `Finish subtasks on "${c.title}" (${done}/${c.subtasks.length})`, reason: `${c.subtasks.length - done} subtask${c.subtasks.length - done > 1 ? "s" : ""} left. Completing moves a ${c.storyPoints}pt ${c.priority} item to review.`, impact: c.priority === "P0" ? "critical" : "high" };
    } else { const old = [...myWip].sort((a, b) => new Date(a.movedAt.in_progress || a.createdAt).getTime() - new Date(b.movedAt.in_progress || b.createdAt).getTime())[0]; topAction = { action: `Ship "${old.title}" — ${daysFromNow(old.movedAt.in_progress || old.createdAt)}d in progress`, reason: `Longest-running WIP (${old.storyPoints}pt ${old.priority}). Shipping frees capacity for ${myTodo.length} queued items.`, impact: "high" }; }
  } else if (teamReviews.length > 0) { topAction = { action: `Review "${teamReviews[0].title}" for ${teamReviews[0].assignee?.name.split(" ")[0] ?? "teammate"}`, reason: `${teamReviews.length} PR${teamReviews.length > 1 ? "s" : ""} waiting. Fast reviews cut team cycle time ~30%.`, impact: "medium" };
  } else if (myTodo.length > 0) { const next = [...myTodo].sort((a, b) => { const p = ["P0","P1","P2","P3"]; return (p.indexOf(a.priority) - p.indexOf(b.priority)) || (b.valueScore - a.valueScore); })[0]; topAction = { action: `Start "${next.title}" (${next.priority}, value ${next.valueScore}/10)`, reason: `Highest-value queued item. ${next.storyPoints}pt in ${next.epic}.`, impact: "medium" };
  } else { topAction = { action: "Pick up unassigned work from backlog", reason: `No assigned tasks. Look for items matching: ${topLabels.map(([l]) => l).join(", ")}.`, impact: "low" }; }

  const risks: AIRisk[] = [];
  myBlocked.forEach((c) => risks.push({ title: `"${c.title}" blocked`, description: `${c.blockedReason}. ${daysFromNow(c.movedAt.in_progress || c.createdAt)}d stuck.${c.priority === "P0" ? " P0 — release impact." : ""}`, severity: c.priority === "P0" ? "critical" : "warning", metric: `${daysFromNow(c.movedAt.in_progress || c.createdAt)}d` }));
  if (myWip.length > 2) risks.push({ title: "Context-switching overload", description: `${myWip.length} items in parallel. 3+ concurrent tasks reduce throughput ~40%.`, severity: "warning", metric: `${myWip.length} WIP` });
  if (highPri.length > 2) risks.push({ title: "High-priority pile-up", description: `${highPri.length} P0/P1 items active. Sprint goal at risk if any slip.`, severity: "warning", metric: `${highPri.length} P0/P1` });
  const stale = myWip.filter((c) => daysFromNow(c.movedAt.in_progress || c.createdAt) > 4);
  if (stale.length > 0) risks.push({ title: "Stale work detected", description: `"${stale[0].title}" in progress ${daysFromNow(stale[0].movedAt.in_progress || stale[0].createdAt)}d without advancing. Hidden blocker?`, severity: "info", metric: `${daysFromNow(stale[0].movedAt.in_progress || stale[0].createdAt)}d` });
  const riskScore = risks.reduce((s, r) => s + (r.severity === "critical" ? 30 : r.severity === "warning" ? 15 : 5), 0);

  const narratives: AINarrative[] = [];
  if (myWip.length > 0) { const subCtx = myWip.filter((c) => c.subtasks.length > 0).map((c) => { const d = c.subtasks.filter((s) => s.completed).length; return `${c.title.split(" ").slice(0, 4).join(" ")}… ${d}/${c.subtasks.length}`; });
    narratives.push({ id: "focus", category: "focus", headline: myWip.length === 1 ? "Single-track focus" : `${myWip.length} parallel streams`,
      narrative: myWip.length === 1 ? `You're focused on "${myWip[0].title}" (${myWip[0].priority}, ${myWip[0].storyPoints}pt). Single-threaded work is optimal for deep focus.${subCtx.length > 0 ? ` Subtask progress: ${subCtx[0]}.` : ""}` : `Active: ${myWip.map((c) => `"${c.title}" (${c.priority})`).join(", ")}. ${myWip.length > 2 ? "Consider parking lower-priority items." : "Manageable workload."}${subCtx.length > 0 ? ` Subtasks: ${subCtx.join("; ")}.` : ""}`,
      aiConfidence: 92, details: myWip.map((c) => ({ label: c.title, value: `${c.priority} · ${c.storyPoints}pt · ${daysFromNow(c.movedAt.in_progress || c.createdAt)}d${c.prLink ? ` · PR ${c.prLink.status}` : ""}`, color: c.priority === "P0" ? "#EF4444" : c.priority === "P1" ? "#F59E0B" : "#22D3EE" })) }); }

  if (teamReviews.length > 0 || myReview.length > 0) { const parts: string[] = [];
    if (myReview.length > 0) parts.push(`${myReview.length} of your PR${myReview.length > 1 ? "s are" : " is"} awaiting review: ${myReview.map((c) => `"${c.title}" on ${c.prLink?.branch ?? "—"}`).join("; ")}.`);
    if (teamReviews.length > 0) parts.push(`${teamReviews.length} teammate PR${teamReviews.length > 1 ? "s need" : " needs"} your review — fastest way to unblock the team. Top: ${teamReviews.slice(0, 2).map((c) => `${c.assignee?.name.split(" ")[0]}'s "${c.title.split(" ").slice(0, 4).join(" ")}…"`).join(", ")}.`);
    narratives.push({ id: "collab", category: "collaboration", headline: `${myReview.length + teamReviews.length} review${(myReview.length + teamReviews.length) > 1 ? "s" : ""} in pipeline`, narrative: parts.join(" "), aiConfidence: 95,
      details: [...myReview.map((c) => ({ label: `YOUR PR: ${c.title}`, value: `${c.prLink?.branch ?? "—"} · ${c.prLink?.status ?? "—"}`, color: "#A78BFA" })), ...teamReviews.slice(0, 3).map((c) => ({ label: `REVIEW: ${c.title}`, value: `by ${c.assignee?.name.split(" ")[0] ?? "—"} · ${c.prLink?.branch ?? "—"}`, color: "#3B82F6" }))] }); }

  { const rate = my.length > 0 ? Math.round((myDone.length / my.length) * 100) : 0;
    const devs = team.filter((t) => t.role === "developer");
    const teamAvg = devs.length > 0 ? Math.round(devs.map((d) => data.filter((c) => c.assignee?.id === d.id && c.status === "done").reduce((s, c) => s + c.storyPoints, 0)).reduce((a, b) => a + b, 0) / devs.length) : 0;
    const vs = totalPts - teamAvg;
    narratives.push({ id: "momentum", category: "momentum", headline: `${totalPts}pt delivered · ${rate}% completion`,
      narrative: `You've completed ${myDone.length} item${myDone.length !== 1 ? "s" : ""} for ${totalPts}pt — ${vs > 3 ? "above" : vs < -3 ? "below" : "near"} team avg of ${teamAvg}pt.${wipPts > 0 ? ` ${wipPts}pt in flight.` : ""}${myTodo.length > 0 ? ` ${myTodo.length} queued.` : " Queue clear."}`,
      aiConfidence: 98, details: [{ label: "Completed", value: `${myDone.length} · ${totalPts}pt`, color: "#2DD4BF" }, { label: "In Progress", value: `${myWip.length} · ${wipPts}pt`, color: "#22D3EE" }, { label: "In Review", value: `${myReview.length}`, color: "#A78BFA" }, { label: "Queued", value: `${myTodo.length}`, color: "#F59E0B" }, { label: "vs Team", value: `${vs >= 0 ? "+" : ""}${vs}pt`, color: vs >= 0 ? "#2DD4BF" : "#EF4444" }] }); }

  { const uhv = data.filter((c) => !c.assignee && c.status === "todo" && c.valueScore >= 6).sort((a, b) => b.valueScore - a.valueScore);
    const matched = uhv.filter((c) => c.labels.some((l) => topLabels.some(([tl]) => tl === l)));
    const recs = (matched.length > 0 ? matched : uhv).slice(0, 3);
    if (recs.length > 0) narratives.push({ id: "opportunity", category: "opportunity", headline: "AI-recommended next pickup",
      narrative: `Based on your expertise in ${topLabels.slice(0, 2).map(([l]) => l).join(" & ")}, these unassigned high-value items match your skill profile. "${recs[0].title}" advances ${recs[0].epic}.`,
      aiConfidence: 85, details: recs.map((c) => ({ label: c.title, value: `${c.priority} · Val ${c.valueScore}/10 · ${c.storyPoints}pt`, color: c.priority === "P0" ? "#EF4444" : c.priority === "P1" ? "#F59E0B" : "#3B82F6" })) }); }

  if (topEpic) { const eT = data.filter((c) => c.epic === topEpic[0]).length, eD = data.filter((c) => c.epic === topEpic[0] && c.status === "done").length;
    narratives.push({ id: "domain", category: "recommendation", headline: `Domain: ${topEpic[0]}`,
      narrative: `${Math.round((topEpic[1] as number / my.length) * 100)}% of your work is in "${topEpic[0]}" (${topEpic[1]}/${my.length}). Epic ${Math.round((eD / eT) * 100)}% done (${eD}/${eT}). Skills: ${topLabels.map(([l, c]) => `${l}(${c})`).join(", ")}.`,
      aiConfidence: 90, details: Object.entries(epicCounts).map(([n, c]) => ({ label: n, value: `${c} card${c > 1 ? "s" : ""}`, color: n === topEpic[0] ? "#A78BFA" : "#64748B" })) }); }

  const avgCT = myDone.length > 0 ? Math.round(myDone.reduce((s, c) => s + daysBetween(c.movedAt.in_progress || c.createdAt, c.movedAt.done || c.createdAt), 0) / myDone.length) : 0;
  const patterns: AIPattern[] = [
    { label: "Sprint Output", value: `${totalPts}pt`, trend: totalPts > 10 ? "up" : totalPts > 0 ? "stable" : "down", context: `${myDone.length} items` },
    { label: "WIP Load", value: `${myWip.length}`, trend: myWip.length > 2 ? "up" : "stable", context: myWip.length > 2 ? "Overloaded" : "Healthy" },
    { label: "Cycle Time", value: avgCT > 0 ? `${avgCT}d` : "—", trend: avgCT > 5 ? "up" : "stable", context: avgCT > 5 ? "Slow" : "On pace" },
    { label: "PR Health", value: `${my.filter((c) => c.prLink?.status === "merged").length}M ${my.filter((c) => c.prLink?.status === "open").length}O ${my.filter((c) => c.prLink?.status === "draft").length}D`, trend: "stable", context: "Merged/Open/Draft" },
  ];

  return { developer: dev.name, devId: dev.id, greeting: `Good ${tod}, ${name}. ${gCtx}`, topAction, patterns, narratives,
    riskAssessment: { score: Math.min(100, riskScore), label: riskScore >= 30 ? "Elevated" : riskScore >= 10 ? "Moderate" : "Nominal", risks },
    sprintContext: { name: currentSprint.name, daysLeft: 4, progress: Math.round((currentSprint.completedPoints / currentSprint.totalPoints) * 100), myContribution: totalPts, teamTotal: currentSprint.completedPoints } };
}

function emptyDashboard(devId: string): PersonalizedDashboard {
  return { developer: "Unknown", devId, greeting: "No data.", topAction: { action: "Select a developer", reason: "No profile.", impact: "low" }, riskAssessment: { score: 0, label: "Nominal", risks: [] }, patterns: [], narratives: [], sprintContext: { name: "—", daysLeft: 0, progress: 0, myContribution: 0, teamTotal: 0 } };
}
