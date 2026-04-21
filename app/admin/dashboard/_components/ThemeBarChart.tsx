"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Theme {
  name: string;
  count: number;
  percentage: number;
}

interface Props {
  themes: Theme[];
}

const COLORS = ["#3b82f6", "#60a5fa", "#60a5fa", "#93c5fd", "#93c5fd", "#bfdbfe", "#bfdbfe"];

export default function ThemeBarChart({ themes }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={themes} layout="vertical" margin={{ left: 10, right: 16 }}>
        <XAxis type="number" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={130}
          tick={{ fontSize: 12, fill: "#475569" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
            fontSize: "13px",
          }}
          formatter={(value, _, props) => {
            const theme = props.payload as Theme;
            return [`${value}명 (${theme.percentage}%)`, "응답자"];
          }}
        />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
          {themes.map((_, i) => (
            <Cell key={i} fill={COLORS[i] || "#bfdbfe"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
