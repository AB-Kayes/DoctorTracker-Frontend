"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export interface AdmissionsTimelineItem {
  date: string;
  total: number;
  admitted: number;
  outpatient: number;
  discharged: number;
}

export function AdmissionsAreaChart({ data }: { data: AdmissionsTimelineItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
        No admissions activity recorded yet
      </div>
    );
  }

  // Format date labels nicely e.g. "Nov 14"
  const formattedData = data.map((item) => {
    const parts = item.date.split("-");
    let label = item.date;
    if (parts.length === 3) {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const m = parseInt(parts[1], 10) - 1;
      label = `${monthNames[m]} ${parseInt(parts[2], 10)}`;
    }
    return {
      ...item,
      formattedDate: label,
    };
  });

  return (
    <div className="h-72 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="patientAdmissionsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="patientAdmittedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0284C7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.6} />
          <XAxis
            dataKey="formattedDate"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "0.75rem",
              fontSize: "12px",
              boxShadow: "var(--shadow-card)",
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            name="Total Patients"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#patientAdmissionsGrad)"
          />
          <Area
            type="monotone"
            dataKey="admitted"
            name="Admitted"
            stroke="#0284C7"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#patientAdmittedGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
