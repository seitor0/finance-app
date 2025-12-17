"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import type { Movimiento, Ahorro } from "@/context/AppContext";
import CalendarHeader from "./CalendarHeader";
import YearHeatmap from "./YearHeatmap";
import MonthCalendar from "./MonthCalendar";
import WeekCalendar from "./WeekCalendar";
import DayDetailPanel from "./DayDetailPanel";
import Tooltip from "./Tooltip";
import type {
  CalendarCell,
  ConsultaIA,
  DaySummary,
  ResumenIA,
  ViewMode,
} from "./types";

const MONTH_OPTIONS = [
  { value: 0, label: "Enero" },
  { value: 1, label: "Febrero" },
  { value: 2, label: "Marzo" },
  { value: 3, label: "Abril" },
  { value: 4, label: "Mayo" },
  { value: 5, label: "Junio" },
  { value: 6, label: "Julio" },
  { value: 7, label: "Agosto" },
  { value: 8, label: "Septiembre" },
  { value: 9, label: "Octubre" },
  { value: 10, label: "Noviembre" },
  { value: 11, label: "Diciembre" },
];

const WEEK_LABEL = (index: number) => `Semana ${index + 1}`;

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

const cloneDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (key: string): Date | null => {
  const [yearStr, monthStr, dayStr] = key.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;
  const day = Number(dayStr);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }
  return new Date(year, month, day);
};

const createEmptyDay = (date: Date): DaySummary => {
  const normalized = cloneDate(date);
  return {
    date: formatDateKey(normalized),
    dateObj: normalized,
    total: 0,
    categoriaPrincipal: null,
    gastos: [],
  };
};

const buildDayMap = (gastos: Movimiento[]): Record<string, DaySummary> => {
  const map: Record<string, DaySummary> = {};

  gastos.forEach((gasto) => {
    if (!gasto.fecha) return;
    const key = gasto.fecha.slice(0, 10);
    const parsedDate = parseDateKey(key);
    if (!parsedDate) return;
    const formattedKey = formatDateKey(parsedDate);

    if (!map[formattedKey]) {
      map[formattedKey] = createEmptyDay(parsedDate);
    }

    const summary = map[formattedKey];
    summary.total += gasto.monto ?? 0;
    summary.gastos.push(gasto);
  });

  Object.values(map).forEach((day) => {
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

  return map;
};

const buildYearCalendar = (dayMap: Record<string, DaySummary>, year: number) => {
  const start = getWeekStart(new Date(year, 0, 1));
  const end = getWeekEnd(new Date(year, 11, 31));

  const weeks: CalendarCell[][] = [];
  let currentWeek: CalendarCell[] = [];
  const cursor = new Date(start);
  let maxValue = 0;
  const monthMarkers: { label: string; weekIndex: number }[] = [];
  const seenMonths = new Set<number>();

  while (cursor <= end) {
    const key = formatDateKey(cursor);
    const summary = dayMap[key] ?? createEmptyDay(cursor);
    const isInPeriod = summary.dateObj.getFullYear() === year;
    if (isInPeriod) {
      maxValue = Math.max(maxValue, summary.total);
    }

    currentWeek.push({ day: summary, isInPeriod });

    if (
      summary.dateObj.getDate() === 1 &&
      isInPeriod &&
      !seenMonths.has(summary.dateObj.getMonth())
    ) {
      monthMarkers.push({ label: MONTH_OPTIONS[summary.dateObj.getMonth()].label, weekIndex: weeks.length });
      seenMonths.add(summary.dateObj.getMonth());
    }

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const total = weeks
    .flat()
    .filter((cell) => cell.isInPeriod)
    .reduce((acc, cell) => acc + cell.day.total, 0);

  return { weeks, maxValue, monthMarkers, total };
};

const buildMonthCalendar = (dayMap: Record<string, DaySummary>, year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const start = getWeekStart(firstDay);
  const end = getWeekEnd(new Date(year, month + 1, 0));

  const weeks: CalendarCell[][] = [];
  let currentWeek: CalendarCell[] = [];
  const cursor = new Date(start);
  let maxValue = 0;

  while (cursor <= end) {
    const key = formatDateKey(cursor);
    const summary = dayMap[key] ?? createEmptyDay(cursor);
    const isInPeriod =
      summary.dateObj.getFullYear() === year && summary.dateObj.getMonth() === month;
    if (isInPeriod) {
      maxValue = Math.max(maxValue, summary.total);
    }

    currentWeek.push({ day: summary, isInPeriod });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const total = weeks
    .flat()
    .filter((cell) => cell.isInPeriod)
    .reduce((acc, cell) => acc + cell.day.total, 0);

  return { weeks, maxValue, total };
};

const normalizeText = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const detectarCategoria = (texto: string): string | undefined => {
  const match = texto.match(/en\s+([a-zA-Záéíóúñ0-9\s]+)/i);
  if (!match) return undefined;
  let categoria = match[1]
    .replace(/[?.!,]/g, "")
    .trim();
  const stopWords = [" este", " esta", " ese", " esa", " año", " mes", " semana", " dia", " día", " total"];
  for (const word of stopWords) {
    const index = categoria.toLowerCase().indexOf(word.trim());
    if (index > 0) {
      categoria = categoria.slice(0, index).trim();
      break;
    }
  }
  return categoria || undefined;
};

const crearConsultaIA = (
  pregunta: string,
  periodo: ConsultaIA["periodo"],
  viewMode: ViewMode
): ConsultaIA | null => {
  const texto = pregunta.trim();
  if (!texto) return null;
  const normalized = normalizeText(texto);

  let tipo: ConsultaIA["tipo"] = "gasto";
  if (normalized.includes("ahorr")) {
    tipo = "ahorro";
  } else if (normalized.includes("ingres")) {
    tipo = "ingreso";
  }

  let operacion: ConsultaIA["operacion"] = "sum";
  if (normalized.includes("promedio") || normalized.includes("promedi")) {
    operacion = "avg";
  } else if (normalized.includes("menos") || normalized.includes("menor")) {
    operacion = "min";
  } else if (normalized.includes("mas") || normalized.includes("más") || normalized.includes("mayor")) {
    operacion = "max";
  }

  const dimension: ConsultaIA["dimension"] | undefined =
    operacion !== "sum" && normalized.includes("mes") && viewMode === "year" ? "month" : undefined;

  return {
    tipo,
    operacion,
    categoria: detectarCategoria(texto),
    periodo,
    dimension,
  };
};

const toDate = (value: string | undefined | null) => {
  if (!value) return null;
  return parseDateKey(value.slice(0, 10));
};

const estaEnPeriodo = (fecha: Date | null, periodo: ConsultaIA["periodo"]) => {
  if (!fecha) return false;
  const desde = parseDateKey(periodo.desde);
  const hasta = parseDateKey(periodo.hasta);
  if (!desde || !hasta) return false;
  return fecha.getTime() >= desde.getTime() && fecha.getTime() <= hasta.getTime();
};

const agruparPorMes = (items: { fecha?: string; monto: number }[]) => {
  const map = new Map<
    string,
    {
      total: number;
      label: string;
    }
  >();

  items.forEach((item) => {
    const fecha = toDate(item.fecha);
    if (!fecha) return;
    const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
    if (!map.has(key)) {
      map.set(key, {
        total: 0,
        label: fecha.toLocaleDateString("es-AR", {
          month: "long",
          year: "numeric",
        }),
      });
    }
    map.get(key)!.total += item.monto;
  });

  return Array.from(map.entries()).map(([key, value]) => ({
    key,
    ...value,
  }));
};

const resolverConsultaIA = (
  consulta: ConsultaIA,
  datasets: { gastos: Movimiento[]; ingresos: Movimiento[]; ahorros: Ahorro[] },
  periodoLabel: string
): ResumenIA => {
  const dataset =
    consulta.tipo === "gasto"
      ? datasets.gastos
      : consulta.tipo === "ingreso"
        ? datasets.ingresos
        : datasets.ahorros;

  const valores = dataset.reduce<{ monto: number; fecha: string }[]>((acc, item) => {
    if (!item.fecha) return acc;
    const fecha = toDate(item.fecha);
    if (!estaEnPeriodo(fecha, consulta.periodo)) return acc;
    if (consulta.categoria && "categoria" in item) {
      const cat = (item.categoria || "").toLowerCase();
      if (!cat.includes(consulta.categoria.toLowerCase())) {
        return acc;
      }
    } else if (consulta.categoria && !("categoria" in item)) {
      return acc;
    }
    const monto = "usd" in item ? item.usd ?? 0 : item.monto ?? 0;
    acc.push({ monto, fecha: item.fecha });
    return acc;
  }, []);

  if (valores.length === 0) {
    return {
      monto: 0,
      operacion: consulta.operacion,
      tipo: consulta.tipo,
      categoria: consulta.categoria,
      descripcion: "No encontré movimientos para ese período con los filtros actuales.",
      periodoLabel,
    };
  }

  if (consulta.dimension === "month") {
    const agrupados = agruparPorMes(valores);
    if (agrupados.length === 0) {
      return {
        monto: 0,
        operacion: consulta.operacion,
        tipo: consulta.tipo,
        categoria: consulta.categoria,
        descripcion: "No encontré meses con movimientos suficientes.",
        periodoLabel,
      };
    }

    const target = agrupados.reduce((prev, current) => {
      if (consulta.operacion === "min") {
        return current.total < prev.total ? current : prev;
      }
      return current.total > prev.total ? current : prev;
    });

    const descriptor =
      consulta.operacion === "min"
        ? "el mes con menor movimiento"
        : "el mes con mayor movimiento";

    return {
      monto: target.total,
      operacion: consulta.operacion,
      tipo: consulta.tipo,
      categoria: consulta.categoria,
      descripcion: `${descriptor} fue ${target.label}.`,
      periodoLabel,
      agregado: {
        etiqueta: target.label,
        monto: target.total,
      },
    };
  }

  const montos = valores.map((v) => v.monto);
  const sumatoria = montos.reduce((acc, val) => acc + val, 0);
  let resultado = sumatoria;

  if (consulta.operacion === "avg") {
    resultado = sumatoria / montos.length;
  } else if (consulta.operacion === "min") {
    resultado = Math.min(...montos);
  } else if (consulta.operacion === "max") {
    resultado = Math.max(...montos);
  }

  const tipoLabel =
    consulta.tipo === "gasto" ? "gastos" : consulta.tipo === "ingreso" ? "ingresos" : "ahorros";
  const descripcionBase =
    consulta.operacion === "sum"
      ? `Total de ${tipoLabel}`
      : consulta.operacion === "avg"
        ? `Promedio de ${tipoLabel}`
        : consulta.operacion === "min"
          ? `Mínimo registrado de ${tipoLabel}`
          : `Máximo registrado de ${tipoLabel}`;

  const descripcionCategoria = consulta.categoria
    ? ` en la categoría ${consulta.categoria}`
    : "";

  return {
    monto: resultado,
    operacion: consulta.operacion,
    tipo: consulta.tipo,
    categoria: consulta.categoria,
    descripcion: `${descripcionBase}${descripcionCategoria}.`,
    periodoLabel,
  };
};

export default function CalendarioGastosPage() {
  const { gastos, ingresos, ahorros } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>("year");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    day: DaySummary;
    position: { x: number; y: number };
  } | null>(null);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [iaPregunta, setIaPregunta] = useState("");
  const [iaRespuesta, setIaRespuesta] = useState<ResumenIA | null>(null);
  const [iaError, setIaError] = useState<string | null>(null);
  const [iaLoading, setIaLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dayMap = useMemo(() => buildDayMap(gastos), [gastos]);

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

  const yearCalendar = useMemo(
    () => buildYearCalendar(dayMap, activeYear),
    [dayMap, activeYear]
  );

  const monthCalendar = useMemo(
    () => buildMonthCalendar(dayMap, activeYear, selectedMonth),
    [dayMap, activeYear, selectedMonth]
  );
  const monthWeeks = monthCalendar.weeks;

  const weekOptions = useMemo(
    () => monthWeeks.map((_, index) => ({ value: index, label: WEEK_LABEL(index) })),
    [monthWeeks]
  );

  const activeWeekIndex = weekOptions.length > 0 ? Math.min(selectedWeek, weekOptions.length - 1) : 0;
  const activeWeek = useMemo(
    () => monthWeeks[activeWeekIndex] ?? [],
    [monthWeeks, activeWeekIndex]
  );
  const activeWeekMax = activeWeek.reduce(
    (acc, cell) => (cell.isInPeriod ? Math.max(acc, cell.day.total) : acc),
    0
  );

  const todayKey = formatDateKey(new Date());

  const selectedDay = useMemo(() => {
    if (!selectedDate) return null;
    const existing = dayMap[selectedDate];
    if (existing) return existing;
    const parsed = parseDateKey(selectedDate);
    if (!parsed) return null;
    return createEmptyDay(parsed);
  }, [dayMap, selectedDate]);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setTooltip(null);
  };

  const handleSelectDay = (day: DaySummary) => {
    setSelectedDate(day.date);
  };

  const handleHoverDay = (day: DaySummary, position: { x: number; y: number }) => {
    if (viewMode !== "year" || day.total === 0) {
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
    setSelectedWeek(0);
    setSelectedDate(null);
    setTooltip(null);
  };

  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    setSelectedWeek(0);
    setSelectedDate(null);
    setTooltip(null);
  };

  const handleWeekChange = (week: number) => {
    setSelectedWeek(week);
  };

  const periodTotals = {
    year: yearCalendar.total,
    month: monthCalendar.total,
    week: activeWeek.filter((cell) => cell.isInPeriod).reduce((acc, cell) => acc + cell.day.total, 0),
  };

  const periodTotal = periodTotals[viewMode];
  const periodLabel =
    viewMode === "year"
      ? `Total ${activeYear}`
      : viewMode === "month"
        ? `${MONTH_OPTIONS[selectedMonth].label} ${activeYear}`
        : `${WEEK_LABEL(activeWeekIndex)} · ${MONTH_OPTIONS[selectedMonth].label}`;

  const periodoActivo = useMemo(() => {
    if (viewMode === "year") {
      return {
        desde: formatDateKey(new Date(activeYear, 0, 1)),
        hasta: formatDateKey(new Date(activeYear, 11, 31)),
      };
    }
    if (viewMode === "month") {
      return {
        desde: formatDateKey(new Date(activeYear, selectedMonth, 1)),
        hasta: formatDateKey(new Date(activeYear, selectedMonth + 1, 0)),
      };
    }
    const inicio = activeWeek[0]?.day.dateObj ?? new Date(activeYear, selectedMonth, 1);
    const fin =
      activeWeek[activeWeek.length - 1]?.day.dateObj ?? new Date(activeYear, selectedMonth, 1);
    return {
      desde: formatDateKey(inicio),
      hasta: formatDateKey(fin),
    };
  }, [activeWeek, activeYear, selectedMonth, viewMode]);

  useEffect(() => {
    setIaRespuesta(null);
    setIaError(null);
  }, [viewMode, activeYear, selectedMonth, activeWeekIndex]);

  const manejarConsultaIA = () => {
    const consulta = crearConsultaIA(iaPregunta, periodoActivo, viewMode);
    if (!consulta) {
      setIaError("No pude entender la pregunta. Probá describirlo con más detalle.");
      setIaRespuesta(null);
      return;
    }
    setIaLoading(true);
    setTimeout(() => {
      try {
        const resultado = resolverConsultaIA(
          consulta,
          { gastos, ingresos, ahorros },
          periodLabel
        );
        setIaRespuesta(resultado);
        setIaError(null);
      } catch (error) {
        setIaError("Ocurrió un error al analizar los datos. Probá otra vez.");
        console.error(error);
      } finally {
        setIaLoading(false);
      }
    }, 0);
  };

  const limpiarPanelIA = () => {
    setIaPregunta("");
    setIaRespuesta(null);
    setIaError(null);
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

  const weekSelectorVisible = viewMode === "week" && weekOptions.length > 0;
  const monthSelectorVisible = viewMode !== "year";

  return (
    <div className="space-y-6">
      <CalendarHeader
        viewMode={viewMode}
        onChangeView={handleViewModeChange}
        years={yearsAvailable}
        selectedYear={activeYear}
        onChangeYear={handleYearChange}
        monthOptions={MONTH_OPTIONS}
        selectedMonth={selectedMonth}
        onChangeMonth={handleMonthChange}
        showMonthSelector={monthSelectorVisible}
        weekOptions={weekOptions}
        selectedWeek={activeWeekIndex}
        onChangeWeek={handleWeekChange}
        showWeekSelector={weekSelectorVisible}
        periodLabel={periodLabel}
        periodTotal={periodTotal}
        formatCurrency={formatCurrencyARS}
      />

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] gap-6">
        <motion.div
          key={`${viewMode}-${activeYear}-${selectedMonth}-${activeWeekIndex}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="glass-card p-6"
        >
          {viewMode === "year" && (
            <YearHeatmap
              weeks={yearCalendar.weeks}
              maxValue={yearCalendar.maxValue}
              selectedDate={selectedDate}
              todayKey={todayKey}
              onSelectDay={handleSelectDay}
              onHoverDay={handleHoverDay}
              onHoverEnd={handleHoverEnd}
              monthMarkers={yearCalendar.monthMarkers}
            />
          )}

          {viewMode === "month" && (
            <MonthCalendar
              monthLabel={`${MONTH_OPTIONS[selectedMonth].label} ${activeYear}`}
              weeks={monthWeeks}
              maxValue={monthCalendar.maxValue}
              selectedDate={selectedDate}
              todayKey={todayKey}
              onSelectDay={handleSelectDay}
            />
          )}

          {viewMode === "week" && (
            <WeekCalendar
              week={activeWeek}
              maxValue={activeWeekMax}
              selectedDate={selectedDate}
              todayKey={todayKey}
              onSelectDay={handleSelectDay}
              formatCurrency={formatCurrencyARS}
            />
          )}
        </motion.div>

        <DayDetailPanel day={selectedDay} formatCurrency={formatCurrencyARS} />
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl" role="img" aria-hidden>
              🤖
            </span>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Análisis con IA</h2>
              <p className="text-sm text-slate-500">
                Preguntá sobre <span className="font-semibold text-slate-800">{periodLabel.toLowerCase()}</span> sin
                salir del calendario.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <textarea
            value={iaPregunta}
            onChange={(e) => setIaPregunta(e.target.value)}
            placeholder="Ej: ¿Cuánto gasté en verdulería este mes?"
            className="min-h-[140px] w-full rounded-3xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={manejarConsultaIA}
              disabled={iaLoading || !iaPregunta.trim()}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
            >
              {iaLoading ? "Analizando..." : "Analizar período"}
            </button>
            <button
              type="button"
              onClick={limpiarPanelIA}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
            >
              Limpiar
            </button>
          </div>
        </div>

        {iaError && (
          <p className="mt-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {iaError}
          </p>
        )}

        {iaRespuesta && (
          <div className="mt-5 space-y-4">
            <div className="rounded-3xl border border-slate-100 bg-white/80 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{iaRespuesta.periodoLabel}</p>
              <p className="mt-2 text-4xl font-semibold text-slate-900">
                {formatCurrencyARS(iaRespuesta.monto)}
              </p>
              <p className="mt-2 text-sm text-slate-600">{iaRespuesta.descripcion}</p>
            </div>

            {iaRespuesta.agregado && (
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Dato destacado</p>
                <p className="text-sm font-semibold text-slate-900">{iaRespuesta.agregado.etiqueta}</p>
                <p className="text-xl font-bold text-emerald-600">
                  {formatCurrencyARS(iaRespuesta.agregado.monto)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {viewMode === "year" && tooltip && tooltip.day.total > 0 && (
        <Tooltip
          day={tooltip.day}
          formatCurrency={formatCurrencyARS}
          position={tooltip.position}
        />
      )}
    </div>
  );
}
