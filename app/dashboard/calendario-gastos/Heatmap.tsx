"use client";

import DayCell from "./DayCell";
import type { DaySummary } from "./types";

export const HEATMAP_SCALE = ["#E5E7EB", "#CFFAFE", "#6EE7B7", "#22C55E", "#064E3B"];

const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

interface HeatmapProps {
  weeks: DaySummary[][];
  maxValue: number;
  selectedDay: DaySummary | null;
  onSelectDay: (day: DaySummary) => void;
  onHoverDay: (day: DaySummary, position: { x: number; y: number }) => void;
  onHoverEnd: () => void;
}

const resolveColor = (total: number, maxValue: number): string => {
  if (total <= 0 || maxValue <= 0) return HEATMAP_SCALE[0];
  const ratio = total / maxValue;
  if (ratio < 0.2) return HEATMAP_SCALE[1];
  if (ratio < 0.4) return HEATMAP_SCALE[2];
  if (ratio < 0.7) return HEATMAP_SCALE[3];
  return HEATMAP_SCALE[4];
};

export default function Heatmap({
  weeks,
  maxValue,
  selectedDay,
  onSelectDay,
  onHoverDay,
  onHoverEnd,
}: HeatmapProps) {
  return (
    <div className="flex gap-2">
      <div className="flex flex-col gap-1 pt-1 text-[10px] uppercase tracking-wide text-slate-400">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="h-6 w-6 text-center leading-6">
            {label}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <DayCell
                  key={`${day.date}-${dayIndex}`}
                  day={day}
                  color={resolveColor(day.total, maxValue)}
                  isSelected={selectedDay?.date === day.date}
                  onSelect={onSelectDay}
                  onHover={onHoverDay}
                  onHoverEnd={onHoverEnd}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
