"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const COLORS = [
  "#4CAF50",
  "#1560DD",
  "#FF9800",
  "#F44336",
  "#9C27B0",
  "#607D8B",
  "#795548",
];

type ChartProps = {
  data: { name: string; value: number }[];
};

export default function Chart({ data }: ChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
        Sin datos
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius="80%"
          innerRadius="55%"
          paddingAngle={2}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: any) =>
            `\$${Number(value).toLocaleString("es-AR")}`
          }
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
