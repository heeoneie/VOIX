"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface FunnelItem {
  question: string;
  responded: number;
}

interface Props {
  data: FunnelItem[];
}

export default function CompletionFunnel({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ bottom: 8 }}>
        <XAxis
          dataKey="question"
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#94a3b8" }}
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
          formatter={(value) => [`${value}명`, "응답자"]}
        />
        <Bar
          dataKey="responded"
          fill="#818cf8"
          radius={[6, 6, 0, 0]}
          barSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
