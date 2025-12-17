"use client";

import clsx from "clsx";
import type { ViewMode } from "./types";

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "year", label: "Año" },
  { value: "month", label: "Mes" },
  { value: "week", label: "Semana" },
];

interface SelectorOption {
  value: number;
  label: string;
}

interface CalendarHeaderProps {
  viewMode: ViewMode;
  onChangeView: (mode: ViewMode) => void;
  years: number[];
  selectedYear: number;
  onChangeYear: (year: number) => void;
  monthOptions: SelectorOption[];
  selectedMonth: number;
  onChangeMonth: (month: number) => void;
  showMonthSelector: boolean;
  weekOptions: SelectorOption[];
  selectedWeek: number;
  onChangeWeek: (week: number) => void;
  showWeekSelector: boolean;
  periodLabel: string;
  periodTotal: number;
  formatCurrency: (value: number) => string;
}

export default function CalendarHeader({
  viewMode,
  onChangeView,
  years,
  selectedYear,
  onChangeYear,
  monthOptions,
  selectedMonth,
  onChangeMonth,
  showMonthSelector,
  weekOptions,
  selectedWeek,
  onChangeWeek,
  showWeekSelector,
  periodLabel,
  periodTotal,
  formatCurrency,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Análisis</p>
        <h1 className="text-3xl font-semibold text-slate-900">Calendario de gastos</h1>
        <p className="text-sm text-slate-500">
          {periodLabel}: <span className="font-semibold text-slate-900">{formatCurrency(periodTotal)}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-1 text-sm font-medium shadow-sm">
          {VIEW_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChangeView(option.value)}
              className={clsx(
                "rounded-xl px-3 py-1 transition",
                viewMode === option.value
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <select
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          value={selectedYear}
          onChange={(e) => onChangeYear(Number(e.target.value))}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        {showMonthSelector && (
          <select
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={selectedMonth}
            onChange={(e) => onChangeMonth(Number(e.target.value))}
          >
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        )}

        {showWeekSelector && (
          <select
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={selectedWeek}
            onChange={(e) => onChangeWeek(Number(e.target.value))}
          >
            {weekOptions.map((week) => (
              <option key={week.value} value={week.value}>
                {week.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
