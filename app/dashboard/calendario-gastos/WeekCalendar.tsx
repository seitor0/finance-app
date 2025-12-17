"use client";

import DayCell from "./DayCell";
import { HEATMAP_SCALE } from "./YearHeatmap";
import type { CalendarCell } from "./types";

const WEEKDAY_LABELS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const resolveColor = (cell: CalendarCell, maxValue: number) => {
  if (!cell.isInPeriod) return "#F8FAFC";
  if (cell.day.total <= 0 || maxValue <= 0) return HEATMAP_SCALE[0];
  const ratio = cell.day.total / maxValue;
  if (ratio < 0.2) return HEATMAP_SCALE[1];
  if (ratio < 0.4) return HEATMAP_SCALE[2];
  if (ratio < 0.7) return HEATMAP_SCALE[3];
  return HEATMAP_SCALE[4];
};

interface WeekCalendarProps {
  week: CalendarCell[];
  maxValue: number;
  selectedDate: string | null;
  todayKey: string;
  onSelectDay: (day: CalendarCell["day"]) => void;
  formatCurrency: (value: number) => string;
}

export default function WeekCalendar({
  week,
  maxValue,
  selectedDate,
  todayKey,
  onSelectDay,
  formatCurrency,
}: WeekCalendarProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Semana seleccionada</h2>
          <p className="text-sm text-slate-500">Analizá tus hábitos día a día.</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-3">
          {week.map((cell, index) => (
            <div key={`${cell.day.date}-${index}`} className="flex flex-col gap-2 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {WEEKDAY_LABELS[index] ?? ""}
              </p>
              <DayCell
                day={cell.day}
                color={resolveColor(cell, maxValue)}
                isSelected={selectedDate === cell.day.date}
                isToday={cell.day.date === todayKey}
                disabled={!cell.isInPeriod}
                onSelect={onSelectDay}
                variant="large"
                className="w-full"
              >
                {cell.isInPeriod && (
                  <div className="pointer-events-none flex h-full w-full items-end justify-end p-2">
                    <p className="text-xs font-semibold text-white drop-shadow-sm">
                      {formatCurrency(cell.day.total)}
                    </p>
                  </div>
                )}
              </DayCell>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
