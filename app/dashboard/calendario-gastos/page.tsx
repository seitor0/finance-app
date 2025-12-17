"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import type { Movimiento } from "@/context/AppContext";
import Heatmap, { HEATMAP_SCALE } from "./Heatmap";
import DayDetailPanel from "./DayDetailPanel";
import Tooltip from "./Tooltip";
import type { DaySummary } from "./types";

const formatCurrencyARS = (value: number) =>
  Number(value || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

const getWeekStart = (date: Date) => {
  const copy = new Date(date);
  const day = (copy.getDay() + 6) % 7; // lunes = 0
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - day);
  return copy;
};

const getWeekEnd = (date: Date) => {
  const copy = new Date(date);
  const day = (copy.getDay() + 6) % 7;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() + (6 - day));
  return copy;
};

type HeatmapData = {
  weeks: DaySummary[][];
  maxValue: number;
};

const emptyDay = (date: string, isCurrentYear: boolean): DaySummary => ({
  date,
  total: 0,
  categoriaPrincipal: null,
  gastos: [],
  isCurrentYear,
});

const buildHeatmapData = (gastos: Movimiento[], year: number): HeatmapData => {
  const byDay: Record<string, DaySummary> = {};

  gastos.forEach((gasto) => {
    if (!gasto.fecha) return;
    const dateKey = gasto.fecha.slice(0, 10);
    const gastoYear = Number(dateKey.slice(0, 4));
    if (gastoYear !== year) return;

    if (!byDay[dateKey]) {
      byDay[dateKey] = emptyDay(dateKey, true);
    }

    byDay[dateKey].total += gasto.monto ?? 0;
    byDay[dateKey].gastos.push(gasto);
  });

  Object.values(byDay).forEach((day) => {
    const categorias: Record<string, number> = {};
    day.gastos.forEach((g) => {
      const categoria = g.categoria || "Sin categoría";
      categorias[categoria] = (categorias[categoria] || 0) + (g.monto ?? 0);
    });

    let mayor = 0;
    let categoriaPrincipal: string | null = null;
    Object.entries(categorias).forEach(([categoria, total]) => {
      if (total >= mayor) {
        mayor = total;
        categoriaPrincipal = categoria;
      }
    });
    day.categoriaPrincipal = categoriaPrincipal;
  });

  const maxValue = Object.values(byDay).reduce((acc, day) => Math.max(acc, day.total), 0);

  const start = getWeekStart(new Date(year, 0, 1));
  const end = getWeekEnd(new Date(year, 11, 31));

  const weeks: DaySummary[][] = [];
  const cursor = new Date(start);
  let currentWeek: DaySummary[] = [];

  while (cursor <= end) {
    const iso = cursor.toISOString().slice(0, 10);
    const isCurrentYearDay = Number(iso.slice(0, 4)) === year;
    const summary = byDay[iso] ? { ...byDay[iso], isCurrentYear: true } : emptyDay(iso, isCurrentYearDay);
    currentWeek.push(summary);

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      const nextDate = new Date(cursor);
      const iso = nextDate.toISOString().slice(0, 10);
      currentWeek.push(emptyDay(iso, Number(iso.slice(0, 4)) === year));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(currentWeek);
  }

  return { weeks, maxValue };
};

export default function CalendarioGastosPage() {
  const { gastos } = useApp();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    day: DaySummary;
    position: { x: number; y: number };
  } | null>(null);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const yearsAvailable = useMemo(() => {
    const set = new Set<number>();
    gastos.forEach((g) => {
      if (!g.fecha) return;
      const year = Number(g.fecha.slice(0, 4));
      if (!Number.isNaN(year)) {
        set.add(year);
      }
    });
    if (set.size === 0) {
      set.add(new Date().getFullYear());
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [gastos]);

  const activeYear = useMemo(() => {
    if (yearsAvailable.includes(selectedYear)) {
      return selectedYear;
    }
    return yearsAvailable[yearsAvailable.length - 1];
  }, [selectedYear, yearsAvailable]);

  const heatmapData = useMemo(() => buildHeatmapData(gastos, activeYear), [gastos, activeYear]);

  const selectedDay = useMemo(() => {
    if (!selectedDate) return null;
    const allDays = heatmapData.weeks.flat();
    return allDays.find((day) => day.date === selectedDate) ?? null;
  }, [heatmapData, selectedDate]);

  const handleSelectDay = (day: DaySummary) => {
    if (!day.isCurrentYear) return;
    setSelectedDate(day.date);
  };

  const handleHoverDay = (day: DaySummary, position: { x: number; y: number }) => {
    if (!day.isCurrentYear || day.total === 0) {
      setTooltip(null);
      return;
    }
    setTooltip({ day, position });
  };

  const handleHoverEnd = () => {
    setTooltip(null);
  };

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setSelectedDate(null);
    setTooltip(null);
  };

  if (isDesktop === null) {
    return (
      <div className="p-8">
        <div className="glass-card h-40 animate-pulse rounded-3xl bg-white/60" />
      </div>
    );
  }

  if (!isDesktop) {
    return (
      <div className="p-8">
        <div className="glass-card p-6 text-center">
          <p className="text-lg font-semibold text-slate-800">
            El análisis de gastos está disponible solo en computadora
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Ingresá desde un escritorio para explorar el calendario de gastos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Análisis</p>
          <h1 className="text-3xl font-semibold text-slate-900">Calendario de gastos</h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-600" htmlFor="year-select">
            Año
          </label>
          <select
            id="year-select"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={activeYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
          >
            {yearsAvailable.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] gap-6">
        <div className="glass-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Heatmap anual</h2>
              <p className="text-sm text-slate-500">Explorá la intensidad de gastos día por día.</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Poco</span>
              <div className="flex items-center gap-1">
                {HEATMAP_SCALE.map((color, idx) => (
                  <span
                    key={`legend-${idx}`}
                    className="h-4 w-4 rounded"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span>Mucho</span>
            </div>
          </div>

          <motion.div
            key={activeYear}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Heatmap
              weeks={heatmapData.weeks}
              maxValue={heatmapData.maxValue}
              selectedDay={selectedDay}
              onSelectDay={handleSelectDay}
              onHoverDay={handleHoverDay}
              onHoverEnd={handleHoverEnd}
            />
          </motion.div>
        </div>

        <DayDetailPanel day={selectedDay} formatCurrency={formatCurrencyARS} />
      </div>

      {heatmapData.maxValue === 0 && (
        <p className="text-center text-sm text-slate-500">
          Todavía no hay gastos cargados para {activeYear}.
        </p>
      )}

      {tooltip && tooltip.day.total > 0 && (
        <Tooltip
          day={tooltip.day}
          formatCurrency={formatCurrencyARS}
          position={tooltip.position}
        />
      )}
    </div>
  );
}
