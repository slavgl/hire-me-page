"use client";

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
  const formatted = data.map((d) => ({
    ...d,
    label: d.date.slice(5),
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={32} />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e5e5" }}
            labelFormatter={(_, p) =>
              p?.[0]?.payload?.date
                ? String(p[0].payload.date)
                : ""
            }
          />
          <Bar dataKey="count" fill="#171717" radius={[4, 4, 0, 0]} name="Views" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
