"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Row = { date: string; count: number };

export function ViewsChart({ data }: { data: Row[] }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const gridStroke = isDark ? "#404040" : "#e5e5e5";
  const tickFill = isDark ? "#a3a3a3" : "#525252";
  const barFill = isDark ? "#fafafa" : "#171717";
  const tooltipStyle = {
    borderRadius: "8px",
    border: isDark ? "1px solid #404040" : "1px solid #e5e5e5",
    background: isDark ? "#171717" : "#ffffff",
    color: isDark ? "#fafafa" : "#171717",
  };

  const formatted = data.map((d) => ({
    ...d,
    label: d.date.slice(5),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: tickFill }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: tickFill }}
            width={32}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(_, p) =>
              p?.[0]?.payload?.date ? String(p[0].payload.date) : ""
            }
          />
          <Bar dataKey="count" fill={barFill} radius={[4, 4, 0, 0]} name="Views" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
