"use client";

import DayCell from "./DayCell";
import type { CalendarCell } from "./types";

export const HEATMAP_SCALE = ["#E5E7EB", "#CFFAFE", "#6EE7B7", "#22C55E", "#064E3B"];

const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

const resolveColor = (total: number, maxValue: number): string => {
  if (total <= 0 || maxValue <= 0) return HEATMAP_SCALE[0];
  const ratio = total / maxValue;
  if (ratio < 0.2) return HEATMAP_SCALE[1];
  if (ratio < 0.4) return HEATMAP_SCALE[2];
  if (ratio < 0.7) return HEATMAP_SCALE[3];
  return HEATMAP_SCALE[4];
};

interface YearHeatmapProps {
  weeks: CalendarCell[][];
  maxValue: number;
  selectedDate: string | null;
  todayKey: string;
  onSelectDay: (day: CalendarCell["day"]) => void;
  onHoverDay: (day: CalendarCell["day"], position: { x: number; y: number }) => void;
  onHoverEnd: () => void;
  monthMarkers: { label: string; weekIndex: number }[];
}

const buildMarkerMap = (markers: { label: string; weekIndex: number }[]) => {
  const map = new Map<number, string>();
  markers.forEach((marker) => {
    map.set(marker.weekIndex, marker.label);
  });
  return map;
};

export default function YearHeatmap({
  weeks,
  maxValue,
  selectedDate,
  todayKey,
  onSelectDay,
  onHoverDay,
  onHoverEnd,
  monthMarkers,
}: YearHeatmapProps) {
  const markerMap = buildMarkerMap(monthMarkers);

  return (
    <div className="flex gap-3">
      <div className="flex flex-col gap-1 pt-8 text-[10px] uppercase tracking-wide text-slate-400">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="h-8 w-8 text-center leading-8">
            {label}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => {
            const label = markerMap.get(weekIndex) ?? "";
            const showDivider = markerMap.has(weekIndex) && weekIndex !== 0;

            return (
              <div
                key={`week-${weekIndex}`}
                className="flex flex-col gap-1"
                style={{ borderLeft: showDivider ? "1px solid rgba(15,23,42,0.1)" : "transparent" }}
              >
                <span className="mb-1 h-5 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {label}
                </span>
                {week.map((cell, dayIndex) => (
                  <DayCell
                    key={`${cell.day.date}-${dayIndex}`}
                    day={cell.day}
                    color={cell.isInPeriod ? resolveColor(cell.day.total, maxValue) : "#F8FAFC"}
                    isSelected={selectedDate === cell.day.date}
                    isToday={cell.day.date === todayKey}
                    disabled={!cell.isInPeriod}
                    onSelect={onSelectDay}
                    onHover={onHoverDay}
                    onHoverEnd={onHoverEnd}
                    variant="compact"
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
