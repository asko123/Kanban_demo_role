"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cfdData } from "@/data/sprints";

export function CFDChart() {
  return (
    <div className="h-[160px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={cfdData} stackOffset="expand">
          <XAxis
            dataKey="day"
            tick={{ fontSize: 8, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            interval={2}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: "rgba(15,17,23,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: "11px",
              color: "#E2E8F0",
            }}
          />
          <Area
            type="monotone"
            dataKey="done"
            stackId="1"
            stroke="#2DD4BF"
            fill="rgba(45,212,191,0.15)"
          />
          <Area
            type="monotone"
            dataKey="review"
            stackId="1"
            stroke="#A78BFA"
            fill="rgba(167,139,250,0.15)"
          />
          <Area
            type="monotone"
            dataKey="in_progress"
            stackId="1"
            stroke="#3B82F6"
            fill="rgba(59,130,246,0.15)"
          />
          <Area
            type="monotone"
            dataKey="todo"
            stackId="1"
            stroke="#F59E0B"
            fill="rgba(245,158,11,0.15)"
          />
          <Area
            type="monotone"
            dataKey="backlog"
            stackId="1"
            stroke="#64748B"
            fill="rgba(100,116,139,0.1)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
