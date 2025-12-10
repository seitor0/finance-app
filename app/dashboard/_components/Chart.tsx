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

type ChartDatum = {
  name: string;
  value: number;
  color?: string;
};

type ChartProps = {
  data: ChartDatum[];
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
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color ?? COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | string) =>
            `\$${Number(value).toLocaleString("es-AR")}`
          }
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
