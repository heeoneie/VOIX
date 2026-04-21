"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface Props {
  distribution: { positive: number; neutral: number; negative: number };
}

const LABELS: Record<string, string> = {
  positive: "긍정",
  neutral: "중립",
  negative: "부정",
};
const COLORS = ["#10b981", "#94a3b8", "#f43f5e"];

export default function SentimentPieChart({ distribution }: Props) {
  const data = Object.entries(distribution).map(([key, value]) => ({
    name: LABELS[key],
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={95}
          paddingAngle={5}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
            fontSize: "13px",
          }}
          formatter={(value) => [`${value}명`, ""]}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: "#475569", fontSize: "13px" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
