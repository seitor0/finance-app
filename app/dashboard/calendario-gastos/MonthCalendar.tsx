"use client";

import DayCell from "./DayCell";
import { HEATMAP_SCALE } from "./YearHeatmap";
import type { CalendarCell } from "./types";

const WEEKDAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];

const resolveColor = (cell: CalendarCell, maxValue: number) => {
  if (!cell.isInPeriod) return "#F8FAFC";
  if (cell.day.total <= 0 || maxValue <= 0) return HEATMAP_SCALE[0];
  const ratio = cell.day.total / maxValue;
  if (ratio < 0.2) return HEATMAP_SCALE[1];
  if (ratio < 0.4) return HEATMAP_SCALE[2];
  if (ratio < 0.7) return HEATMAP_SCALE[3];
  return HEATMAP_SCALE[4];
};

interface MonthCalendarProps {
  monthLabel: string;
  weeks: CalendarCell[][];
  maxValue: number;
  selectedDate: string | null;
  todayKey: string;
  onSelectDay: (day: CalendarCell["day"]) => void;
}

export default function MonthCalendar({
  monthLabel,
  weeks,
  maxValue,
  selectedDate,
  todayKey,
  onSelectDay,
}: MonthCalendarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{monthLabel}</h2>
          <p className="text-sm text-slate-500">Calendario mensual detallado.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-2">
          {weeks.flat().map((cell, index) => (
            <DayCell
              key={`${cell.day.date}-${index}`}
              day={cell.day}
              color={resolveColor(cell, maxValue)}
              isSelected={selectedDate === cell.day.date}
              isToday={cell.day.date === todayKey}
              disabled={!cell.isInPeriod}
              onSelect={onSelectDay}
              variant="regular"
              className="w-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
