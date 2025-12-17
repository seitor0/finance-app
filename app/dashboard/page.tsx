"use client";

import { useState, useMemo, useEffect } from "react";
import clsx from "clsx";
import { useApp } from "@/context/AppContext";
import type {
  PaymentStatus,
  ToPayItem,
  ToCollectItem,
  CobroStatus,
} from "@/context/AppContext";
import type { ResultadoIA } from "@/app/api/ai-input/schema";
import AppleRings from "./_components/AppleRings";
import FinanzasDelMes from "./_components/FinanzasDelMes";
import WidgetDisponible from "./_components/WidgetDisponible";

type MovimientoUI = {
  id: string;
  descripcion: string;
  monto: number | null;
  fecha: string;
  tipo: "Ingreso" | "Gasto";
};

const formatCurrencyARS = (value: number) =>
  Number(value || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });

const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
};

function isResultadoIA(
  data: ResultadoIA | Record<string, unknown>
): data is ResultadoIA {
  if (!data || typeof data !== "object") return false;

  const tipo = (data as { tipo?: unknown }).tipo;
  return (
    tipo === "gasto" ||
    tipo === "ingreso" ||
    tipo === "ahorro" ||
    tipo === "compra-usd" ||
    tipo === "venta-usd"
  );
}

export default function DashboardPage() {
  const {
    ingresos,
    gastos,
    gastosPagados,
    gastosConsumo,
    ahorros,
    cosasPorPagar,
    cosasPorCobrar,
    agregarIngreso,
    agregarGasto,
    agregarAhorro,
    cambiarEstadoPago,
    editarCosaPorCobrar,
  } = useApp();

  const [modoHistorial, setModoHistorial] = useState<"pagado" | "consumo">("pagado");

  // ============================
// FECHA ACTUAL
// ============================
const ahora = new Date();
const añoActual = ahora.getFullYear();
const mesActualNumero = ahora.getMonth() + 1;
const mesActualKey = `${añoActual}-${String(mesActualNumero).padStart(2, "0")}`;

// ============================
// INGRESOS DEL MES
// ============================
const totalIngresosMes = useMemo(
  () =>
    ingresos
      .filter((i) => (i.fecha ?? "").startsWith(mesActualKey))
      .reduce((acc, i) => acc + Number(i.monto ?? 0), 0),
  [ingresos, mesActualKey]
);

// ============================
// GASTOS DEL MES
// ============================
const totalGastosMes = useMemo(
  () =>
    gastos
      .filter((g) => (g.fecha ?? "").startsWith(mesActualKey))
      .reduce((acc, g) => acc + Number(g.monto ?? 0), 0),
  [gastos, mesActualKey]
);

// ============================
// DEUDAS (cosas por pagar)
// ============================
const deudasMes = useMemo(
  () =>
    cosasPorPagar.filter(
      (c) =>
        (c.status === "falta" || c.status === "pospuesto") &&
        (!(c.vencimiento ?? "") || (c.vencimiento ?? "").startsWith(mesActualKey))
    ),
  [cosasPorPagar, mesActualKey]
);

const totalDeudasMes = useMemo(
  () => deudasMes.reduce((acc, c) => acc + Number(c.monto ?? 0), 0),
  [deudasMes]
);

// ============================
// COBROS PENDIENTES (nuevo)
// ============================
const cobrosMes = useMemo(
  () =>
    cosasPorCobrar.filter(
      (c) =>
        c.status !== "cobrado" &&
        (!(c.vencimiento ?? "") || (c.vencimiento ?? "").startsWith(mesActualKey))
    ),
  [cosasPorCobrar, mesActualKey]
);

const totalCobrosPendientes = useMemo(
  () => cobrosMes.reduce((acc, c) => acc + Number(c.monto ?? 0), 0),
  [cobrosMes]
);

// ============================
// AHORRO REAL
// ============================
const ahorroRealMes = Math.max(totalIngresosMes - totalGastosMes, 0);
const ahorroDeseado = totalIngresosMes * 0.2;
const gastoIdeal = totalIngresosMes * 0.5;

// ============================
// ÚLTIMOS MOVIMIENTOS
// ============================
  const movimientosHistorial = useMemo(() => {
    const fuenteGastos = modoHistorial === "pagado" ? gastosPagados : gastosConsumo;
    const lista: MovimientoUI[] = [
      ...ingresos.map((i) => ({
        id: `ing-${i.id}`,
        descripcion: i.descripcion || "Ingreso",
        monto: i.monto ?? 0,
        fecha: i.fecha ?? "",
        tipo: "Ingreso" as const,
      })),
      ...fuenteGastos.map((g) => ({
        id: `gas-${g.id}`,
        descripcion: g.descripcion || "Gasto",
        monto: g.monto ?? 0,
        fecha: g.fecha ?? "",
        tipo: "Gasto" as const,
      })),
    ];

    return lista
      .filter((m) => m.fecha)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 8);
  }, [ingresos, gastosPagados, gastosConsumo, modoHistorial]);

// ============================
// AHORROS USD
// ============================
const totalUSD = useMemo(
  () => (ahorros ?? []).reduce((acc, a) => acc + (a.usd ?? 0), 0),
  [ahorros]
);

  const [fechaHoy, setFechaHoy] = useState(getTodayKey());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFechaHoy((prev) => {
        const actual = getTodayKey();
        return prev === actual ? prev : actual;
      });
    }, 60 * 60 * 1000);

    return () => window.clearInterval(interval);
  }, []);

  type MovimientoDetalle = {
    id: string;
    tipo: "Ingreso" | "Gasto" | "Deuda" | "Tarjeta";
    descripcion: string;
    monto: number;
    fecha: string;
  };

  const ultimosMovimientos = useMemo<MovimientoDetalle[]>(() => {
    const ingresoMovs = ingresos.map(
      (i): MovimientoDetalle => ({
        id: `ing-${i.id}`,
        tipo: "Ingreso",
        descripcion: i.descripcion || "Ingreso",
        monto: Number(i.monto ?? 0),
        fecha: i.fecha ?? "",
      })
    );

    const gastoMovs = gastos.map(
      (g): MovimientoDetalle => ({
        id: `gas-${g.id}`,
        tipo: "Gasto",
        descripcion: g.descripcion || "Gasto",
        monto: Number(g.monto ?? 0),
        fecha: g.fecha ?? "",
      })
    );

    const deudasPagadas = cosasPorPagar
      .filter((c) => c.status === "pagado")
      .map(
        (c): MovimientoDetalle => ({
          id: `deu-${c.id}`,
          tipo: "Deuda",
          descripcion: c.nombre || "Pago de deuda",
          monto: Number(c.monto ?? 0),
          fecha: c.vencimiento || new Date().toISOString().slice(0, 10),
        })
      );

    return [...ingresoMovs, ...gastoMovs, ...deudasPagadas]
      .filter((m) => m.fecha)
      .sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      )
      .slice(0, 5);
  }, [ingresos, gastos, cosasPorPagar]);

  const proximosVencimientos = useMemo(() => {
    const hoy = new Date();
    return cosasPorPagar
      .filter((c): c is ToPayItem & { vencimiento: string } => {
        return c.status !== "pagado" && Boolean(c.vencimiento);
      })
      .map((c) => {
        const fecha = new Date(c.vencimiento);
        const diffDias = Math.ceil(
          (fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
        );
        return { ...c, diffDias, fecha };
      })
      .filter((c) => c.diffDias <= 7)
      .sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
      .slice(0, 5);
  }, [cosasPorPagar]);

  const flujoMensual = useMemo(() => {
    const diasEnMes = new Date(añoActual, mesActualNumero, 0).getDate();
    const ingresoMapa: Record<number, number> = {};
    const gastoMapa: Record<number, number> = {};

    ingresos.forEach((i) => {
      if ((i.fecha ?? "").startsWith(mesActualKey)) {
        const dia = Number(i.fecha?.slice(8, 10)) || 1;
        ingresoMapa[dia] = (ingresoMapa[dia] || 0) + Number(i.monto ?? 0);
      }
    });

    gastos.forEach((g) => {
      if ((g.fecha ?? "").startsWith(mesActualKey)) {
        const dia = Number(g.fecha?.slice(8, 10)) || 1;
        gastoMapa[dia] = (gastoMapa[dia] || 0) + Number(g.monto ?? 0);
      }
    });

    const data = [];
    let acumIngreso = 0;
    let acumGasto = 0;
    for (let dia = 1; dia <= diasEnMes; dia++) {
      acumIngreso += ingresoMapa[dia] || 0;
      acumGasto += gastoMapa[dia] || 0;
      data.push({ dia, ingreso: acumIngreso, gasto: acumGasto });
    }

    const maxValor = Math.max(
      ...data.map((d) => Math.max(d.ingreso, d.gasto)),
      1
    );

    return { data, maxValor };
  }, [ingresos, gastos, mesActualKey, añoActual, mesActualNumero]);

  const sugerenciasAI = useMemo(() => {
    const [anioStr, mesStr, diaStr] = fechaHoy.split("-");
    const parsedYear = Number(anioStr);
    const parsedMonth = Number(mesStr);
    const parsedDay = Number(diaStr);

    const referenceDate =
      Number.isFinite(parsedYear) && Number.isFinite(parsedMonth) && Number.isFinite(parsedDay)
        ? new Date(parsedYear, parsedMonth - 1, parsedDay)
        : new Date();

    const diaMes = referenceDate.getDate();
    const diasEnMes = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0).getDate();
    const diasRestantes = Math.max(diasEnMes - diaMes, 0);
    const gastoPromedioDiario = diaMes ? totalGastosMes / diaMes : 0;
    const gastoProyectadoMes = gastoPromedioDiario * diasEnMes;
    const ahorroFaltante = Math.max(ahorroDeseado - ahorroRealMes, 0);
    const ahorroExcedente = Math.max(ahorroRealMes - ahorroDeseado, 0);

    const diasTip =
      diasRestantes === 0
        ? "Hoy cierra el mes, revisá tus gastos y registrá todo lo pendiente."
        : `Quedan ${diasRestantes} días del mes, ajustá tus gastos si es necesario.`;

    const promedioTip =
      totalGastosMes > 0
        ? `Tu gasto promedio diario es ${formatCurrencyARS(
            gastoPromedioDiario
          )}. A este ritmo cerrarías el mes con ${formatCurrencyARS(gastoProyectadoMes)}.`
        : "Todavía no hay gastos cargados este mes. Aprovechá para registrar los primeros movimientos.";

    const ahorroTip =
      ahorroFaltante > 0
        ? `Estás a ${formatCurrencyARS(
            ahorroFaltante
          )} de alcanzar tu objetivo de ahorro mensual.`
        : `Ya superaste tu objetivo de ahorro del mes por ${formatCurrencyARS(ahorroExcedente)}.`;

    const pool: string[] = [ahorroTip];

    if (totalDeudasMes > 0) {
      pool.push(`Tenés ${formatCurrencyARS(totalDeudasMes)} por pagar este mes.`);
    } else {
      pool.push("No hay pagos pendientes por vencer este mes. Seguí así.");
    }

    if (totalCobrosPendientes > 0) {
      pool.push(`Recordá cobrar ${formatCurrencyARS(totalCobrosPendientes)} en los próximos días.`);
    } else {
      pool.push("No tenés cobros pendientes. Podés enfocarte en tus metas.");
    }

    const seed = Number.parseInt(fechaHoy.replace(/-/g, ""), 10) || 1;
    const poolIndex = pool.length > 0 ? seed % pool.length : 0;
    const extraTip = pool[poolIndex] ?? "Revisá tus categorías más grandes para ajustar el mes.";

    return [diasTip, promedioTip, extraTip];
  }, [
    ahorroDeseado,
    ahorroRealMes,
    fechaHoy,
    totalCobrosPendientes,
    totalDeudasMes,
    totalGastosMes,
  ]);

  const iconoMovimiento: Record<MovimientoDetalle["tipo"], string> = {
    Ingreso: "💰",
    Gasto: "💳",
    Deuda: "🧾",
    Tarjeta: "⚙️",
  };

  type HighlightTone = "success" | "warning" | "danger";

  const [deudaHighlights, setDeudaHighlights] = useState<Record<string, HighlightTone>>({});
  const [cobroHighlights, setCobroHighlights] = useState<Record<string, HighlightTone>>({});
  const [updatingDeuda, setUpdatingDeuda] = useState<string | null>(null);
  const [updatingCobro, setUpdatingCobro] = useState<string | null>(null);

  const highlightClasses: Record<HighlightTone, string> = {
    success: "bg-emerald-50",
    warning: "bg-amber-50",
    danger: "bg-rose-50",
  };

  const getVencimientoClasses = (diffDias: number) => {
    if (diffDias < 0) {
      return {
        wrapper: "border border-rose-100 bg-rose-50",
        badge: "text-rose-600",
      };
    }
    if (diffDias === 0) {
      return {
        wrapper: "border border-amber-100 bg-amber-50",
        badge: "text-amber-600",
      };
    }
    return {
      wrapper: "border border-slate-200 bg-white",
      badge: "text-slate-500",
    };
  };

  const paymentTone = (status: PaymentStatus): HighlightTone => {
    if (status === "pagado") return "success";
    if (status === "pospuesto") return "warning";
    return "danger";
  };

  const cobroTone = (status: CobroStatus): HighlightTone => {
    if (status === "cobrado") return "success";
    if (status === "facturado") return "warning";
    return "danger";
  };

  const triggerHighlight = (
    setter: React.Dispatch<React.SetStateAction<Record<string, HighlightTone>>>,
    id: string,
    tone: HighlightTone
  ) => {
    setter((prev) => ({ ...prev, [id]: tone }));
    setTimeout(() => {
      setter((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 1000);
  };

  const pagoOptions: { label: string; value: PaymentStatus }[] = [
    { label: "Falta", value: "falta" },
    { label: "Pagado", value: "pagado" },
    { label: "Pospuesto", value: "pospuesto" },
  ];

  const cobroOptions: { label: string; value: CobroStatus }[] = [
    { label: "Pendiente", value: "terminado" },
    { label: "Facturado", value: "facturado" },
    { label: "Terminado", value: "cobrado" },
  ];

  const buildPolylinePoints = (key: "ingreso" | "gasto") => {
    const dataset = flujoMensual.data;
    if (dataset.length === 0) return "0,100 100,100";
    const divisor = dataset.length > 1 ? dataset.length - 1 : 1;
    return dataset
      .map((d, idx) => {
        const x = (idx / divisor) * 100;
        const rawY = 100 - (d[key] / flujoMensual.maxValor) * 100;
        const y = Number.isFinite(rawY) ? rawY : 100;
        return `${x},${y}`;
      })
      .join(" ");
  };

  const ingresoPoints = buildPolylinePoints("ingreso");
  const gastoPoints = buildPolylinePoints("gasto");

  const handleEstadoDeuda = async (item: ToPayItem, next: PaymentStatus) => {
    if (next === item.status) return;
    setUpdatingDeuda(item.id);
    try {
      await cambiarEstadoPago(item.id, next);
      triggerHighlight(setDeudaHighlights, item.id, paymentTone(next));
    } finally {
      setUpdatingDeuda(null);
    }
  };

  const handleEstadoCobro = async (item: ToCollectItem, next: CobroStatus) => {
    if (next === item.status) return;
    setUpdatingCobro(item.id);
    try {
      await editarCosaPorCobrar(item.id, { status: next });
      triggerHighlight(setCobroHighlights, item.id, cobroTone(next));
    } finally {
      setUpdatingCobro(null);
    }
  };

  // ============================
  // IA
  // ============================
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState<ResultadoIA | Record<string, unknown> | null>(null);

  async function enviarAI() {
    if (!texto.trim()) return;
    setLoading(true);
    try {
      const resp = await fetch("/api/ai-input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });

      const raw = (await resp.json()) as ResultadoIA | Record<string, unknown>;

      if (!isResultadoIA(raw)) {
        setRespuesta(raw);
        return;
      }

      setRespuesta(raw);

      if (raw.tipo === "gasto") {
        await agregarGasto({
          descripcion: raw.descripcion,
          monto: raw.monto ?? 0,
          fecha: raw.fecha,
          categoria: "General",
          tipo: "Gasto" as const,
        });
      }

      if (raw.tipo === "ingreso") {
        await agregarIngreso({
          descripcion: raw.descripcion,
          monto: raw.monto ?? 0,
          fecha: raw.fecha,
          tipo: "Ingreso" as const,
        });
      }

      if (raw.tipo === "ahorro") {
        await agregarAhorro({ usd: raw.usd, fecha: raw.fecha, notas: "Ahorro por IA" });
      }

      if (raw.tipo === "compra-usd") {
        await agregarAhorro({ usd: raw.usd, fecha: raw.fecha, notas: "Compra de dólares" });
      }

      if (raw.tipo === "venta-usd") {
        await agregarAhorro({ usd: -raw.usd, fecha: raw.fecha, notas: "Venta de dólares" });
      }
    } finally {
      setLoading(false);
      setTexto("");
    }
  }

  // ============================
  // RENDER
  // ============================
  return (
    <div className="space-y-8 fade-up">
      {/* ============================ FILA 1 — Balance + Rings ============================ */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        {/* IZQUIERDA */}
        <div className="glass-card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Este mes</p>
              <h2 className="text-2xl font-semibold mt-1">Balance general</h2>
              <p className="text-sm text-slate-500 mt-1">
                Ingresos, gastos, pendientes, cobros y ahorro actual.
              </p>
            </div>

            {/* Totales */}
            <div className="text-right">

              {/* GASTOS */}
              <p className="text-xs text-slate-400">Gastos del mes</p>
              <p className="text-3xl font-semibold text-rose-600">
                ${totalGastosMes.toLocaleString("es-AR")}
              </p>

              {/* DEUDAS */}
              {totalDeudasMes > 0 && (
                <>
                  <p className="text-xs text-slate-400 mt-2">Deudas del mes</p>
                  <p className="text-2xl font-semibold text-amber-500">
                    ${totalDeudasMes.toLocaleString("es-AR")}
                  </p>
                </>
              )}

              {/* COBROS PENDIENTES - NUEVO */}
              {totalCobrosPendientes > 0 && (
                <>
                  <p className="text-xs text-slate-400 mt-2">Cobros pendientes</p>
                  <p className="text-2xl font-semibold text-emerald-500">
                    ${totalCobrosPendientes.toLocaleString("es-AR")}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Apple Rings */}
          <AppleRings
            ingresosMes={totalIngresosMes}
            gastosMes={totalGastosMes}
            pendientesMes={totalDeudasMes}
            cobrosPendientes={totalCobrosPendientes}  // 👈 TE LO AGREGO EN LA PROP
          />

          {proximosVencimientos.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-700">Próximos vencimientos</h3>
                <a
                  href="/dashboard/cosas-por-pagar"
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Ver todo →
                </a>
              </div>
              <div className="space-y-2">
                {proximosVencimientos.map((item) => {
                  const { wrapper, badge } = getVencimientoClasses(item.diffDias);
                  return (
                    <div
                      key={item.id}
                      className={clsx(
                        "flex items-center justify-between rounded-2xl px-4 py-2 text-sm transition-colors",
                        wrapper
                      )}
                    >
                      <div>
                        <p className="font-semibold text-slate-800 flex items-center gap-2">
                          <span role="img" aria-hidden>
                            🗓️
                          </span>
                          {item.nombre}
                        </p>
                        <p className="text-xs text-slate-500">
                          Vence {item.vencimiento} · ${Number(item.monto ?? 0).toLocaleString("es-AR")}
                        </p>
                      </div>
                      <span className={clsx("text-xs font-semibold", badge)}>
                        {item.diffDias < 0
                          ? `${Math.abs(item.diffDias)}d vencidos`
                          : item.diffDias === 0
                          ? "Hoy"
                          : `En ${item.diffDias}d`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lista de deudas */}
          {deudasMes.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Deudas</h3>
              <div className="space-y-3">
                {deudasMes.map((d) => {
                  const tone = deudaHighlights[d.id];
                  return (
                    <div
                      key={d.id}
                      className={clsx(
                        "flex flex-col gap-3 rounded-2xl border border-slate-200/70 px-4 py-3 text-sm transition-colors duration-500 md:flex-row md:items-center md:justify-between",
                        tone && highlightClasses[tone]
                      )}
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{d.nombre}</p>
                        <p className="text-xs text-slate-500">
                          ${Number(d.monto ?? 0).toLocaleString("es-AR")} · {d.vencimiento || "Sin fecha"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span role="img" aria-hidden className="text-lg">
                          🪄
                        </span>
                        <select
                          value={d.status}
                          onChange={(e) => handleEstadoDeuda(d, e.target.value as PaymentStatus)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none"
                          disabled={updatingDeuda === d.id}
                          title="Cambiar estado"
                        >
                          {pagoOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Lista de cobros pendientes */}
          {cobrosMes.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-emerald-600 mb-2">Cobros pendientes</h3>
              <div className="space-y-3">
                {cobrosMes.map((c) => {
                  const tone = cobroHighlights[c.id];
                  return (
                    <div
                      key={c.id}
                      className={clsx(
                        "flex flex-col gap-3 rounded-2xl border border-emerald-100 px-4 py-3 text-sm transition-colors duration-500 md:flex-row md:items-center md:justify-between",
                        tone && highlightClasses[tone]
                      )}
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{c.nombre}</p>
                        <p className="text-xs text-slate-500">
                          ${Number(c.monto ?? 0).toLocaleString("es-AR")} · {c.vencimiento || "Sin fecha"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span role="img" aria-hidden className="text-lg">
                          🪄
                        </span>
                        <select
                          value={c.status}
                          onChange={(e) => handleEstadoCobro(c, e.target.value as CobroStatus)}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm focus:outline-none"
                          disabled={updatingCobro === c.id}
                          title="Actualizar estado"
                        >
                          {cobroOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ====================== DERECHA ====================== */}
        <div className="space-y-4">
          <div className="glass-card p-0">
            <WidgetDisponible variant="hero" className="w-full" />
          </div>

          <div className="glass-card">
            <h2 className="text-lg font-semibold mb-3">Cargar con IA</h2>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder='Ej: "Gaste 20.000 en el super" o "Cobré 700.000"'
              className="w-full h-28 p-4 rounded-2xl border border-slate-300 bg-white text-slate-800 placeholder-slate-400 text-sm"
            />
            <button
              onClick={enviarAI}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Procesando..." : "Enviar"}
            </button>

            {respuesta && (
              <pre className="text-xs mt-4 bg-white p-4 rounded-xl border border-blue-200 shadow">
                {JSON.stringify(respuesta, null, 2)}
              </pre>
            )}

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <span role="img" aria-hidden>
                  🤖
                </span>
                Sugerencias automáticas
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {sugerenciasAI.map((tip, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-blue-500">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {ultimosMovimientos.length > 0 && (
            <div className="glass-card">
              <h3 className="text-lg font-semibold mb-3">Últimos movimientos</h3>
              <ul className="space-y-3">
                {ultimosMovimientos.map((mov) => (
                  <li
                    key={mov.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" role="img" aria-hidden>
                        {iconoMovimiento[mov.tipo]}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">{mov.descripcion}</p>
                        <p className="text-xs text-slate-500">{mov.fecha || "—"}</p>
                      </div>
                    </div>
                    <p
                      className={clsx(
                        "text-sm font-semibold",
                        mov.tipo === "Ingreso" ? "text-emerald-600" : "text-rose-600"
                      )}
                    >
                      {mov.tipo === "Ingreso" ? "+" : "-"}$
                      {Number(mov.monto ?? 0).toLocaleString("es-AR")}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="glass-card">
            <h3 className="text-lg font-semibold mb-4">Objetivos del mes</h3>

            <div className="flex items-center justify-between text-sm">
              <span>Ahorro deseado</span>
              <strong>${Math.round(ahorroDeseado).toLocaleString("es-AR")}</strong>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{
                  width:
                    ahorroDeseado > 0
                      ? `${Math.min((ahorroRealMes / ahorroDeseado) * 100, 100)}%`
                      : "0%",
                }}
              />
            </div>

            <div className="flex items-center justify-between text-sm mt-4">
              <span>Gasto ideal</span>
              <strong>${Math.round(gastoIdeal).toLocaleString("es-AR")}</strong>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-rose-500 transition-all"
                style={{
                  width:
                    gastoIdeal > 0
                      ? `${Math.min((totalGastosMes / gastoIdeal) * 100, 100)}%`
                      : "0%",
                }}
              />
            </div>
          </div>

          <div className="glass-card">
            <h3 className="text-lg font-semibold mb-1">Ahorro en dólares</h3>
            <p className="text-sm text-slate-500 mb-4">Total acumulado.</p>
            <p className="text-3xl font-semibold text-slate-900">
              USD {totalUSD.toLocaleString("es-AR")}
            </p>
          </div>
        </div>
      </section>

      {/* ============================ FILA 2 — Finanzas ============================ */}
      <section className="glass-card">
        <FinanzasDelMes gastos={gastos} />
      </section>

      <section className="glass-card">
        <h2 className="text-lg font-semibold mb-2">Flujo mensual</h2>
        <p className="text-sm text-slate-500 mb-4">
          Evolución acumulada de ingresos vs. gastos durante el mes.
        </p>
        <div className="h-56 w-full">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            <polyline
              points={ingresoPoints}
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="round"
              className="drop-shadow"
            />
            <polyline
              points={gastoPoints}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-2 w-6 rounded-full bg-blue-600" />
            Ingresos acumulados
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-6 rounded-full bg-rose-500" />
            Gastos acumulados
          </div>
        </div>
      </section>

      {/* ============================ FILA 3 — Últimos movimientos ============================ */}
      <section className="glass-card">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Histórico de movimientos</h2>
            <p className="text-sm text-slate-500">
              {modoHistorial === "pagado"
                ? "Mostrando ingresos y gastos ya pagados."
                : "Mostrando ingresos y todos los consumos (incluye tarjeta pendiente)."}
            </p>
          </div>
          <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => setModoHistorial("pagado")}
              className={clsx(
                "px-4 py-1.5 rounded-2xl transition",
                modoHistorial === "pagado"
                  ? "bg-white text-slate-900 shadow"
                  : "text-slate-500"
              )}
            >
              Pagado
            </button>
            <button
              type="button"
              onClick={() => setModoHistorial("consumo")}
              className={clsx(
                "px-4 py-1.5 rounded-2xl transition",
                modoHistorial === "consumo"
                  ? "bg-white text-slate-900 shadow"
                  : "text-slate-500"
              )}
            >
              Consumo
            </button>
          </div>
        </div>

        {movimientosHistorial.length === 0 ? (
          <p className="text-sm text-slate-500">
            Todavía no hay movimientos en este modo.
          </p>
        ) : (
          <div className="space-y-3">
            {movimientosHistorial.map((m) => (
              <div
                key={m.id}
                className={`rounded-2xl p-4 flex items-center justify-between shadow-md text-white bg-gradient-to-r ${
                  m.tipo === "Ingreso"
                    ? "from-emerald-500 via-emerald-400 to-emerald-500"
                    : "from-rose-500 via-rose-400 to-rose-500"
                }`}
              >
                <div>
                  <p className="text-xs tracking-wide opacity-80">{m.tipo}</p>
                  <p className="text-sm font-semibold">{m.descripcion}</p>
                  <p className="text-[11px] opacity-80 mt-1">
                    {new Date(m.fecha).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>

                <p className="text-lg font-semibold">
                  {m.tipo === "Ingreso" ? "+" : "-"}$
                  {Number(m.monto).toLocaleString("es-AR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
