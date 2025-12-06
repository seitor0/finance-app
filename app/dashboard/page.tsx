"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import AppleRings from "./_components/AppleRings";
import FinanzasDelMes from "./_components/FinanzasDelMes";
import WidgetCosasPorPagar from "./_components/WidgetCosasPorPagar";
import WidgetDisponible from "./_components/WidgetDisponible";

type MovimientoUI = {
  id: string;
  descripcion: string;
  monto: number | null;
  fecha: string;
  tipo: "Ingreso" | "Gasto";
};

export default function DashboardPage() {
  const {
    ingresos,
    gastos,
    ahorros,
    cosasPorPagar,
    cosasPorCobrar,          // 👈 agregado
    agregarIngreso,
    agregarGasto,
    agregarAhorro,
  } = useApp();

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
      .filter((i: any) => (i.fecha ?? "").startsWith(mesActualKey))
      .reduce((acc: number, i: any) => acc + Number(i.monto ?? 0), 0),
  [ingresos, mesActualKey]
);

// ============================
// GASTOS DEL MES
// ============================
const totalGastosMes = useMemo(
  () =>
    gastos
      .filter((g: any) => (g.fecha ?? "").startsWith(mesActualKey))
      .reduce((acc: number, g: any) => acc + Number(g.monto ?? 0), 0),
  [gastos, mesActualKey]
);

// ============================
// DEUDAS (cosas por pagar)
// ============================
const deudasMes = useMemo(
  () =>
    cosasPorPagar.filter(
      (c: any) =>
        (c.status === "falta" || c.status === "pospuesto") &&
        (!(c.vencimiento ?? "") || (c.vencimiento ?? "").startsWith(mesActualKey))
    ),
  [cosasPorPagar, mesActualKey]
);

const totalDeudasMes = useMemo(
  () => deudasMes.reduce((acc: number, c: any) => acc + Number(c.monto ?? 0), 0),
  [deudasMes]
);

// ============================
// COBROS PENDIENTES (nuevo)
// ============================
const cobrosMes = useMemo(
  () =>
    cosasPorCobrar.filter(
      (c: any) =>
        c.status !== "cobrado" &&
        (!(c.vencimiento ?? "") || (c.vencimiento ?? "").startsWith(mesActualKey))
    ),
  [cosasPorCobrar, mesActualKey]
);

const totalCobrosPendientes = useMemo(
  () => cobrosMes.reduce((acc: number, c: any) => acc + Number(c.monto ?? 0), 0),
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
const movimientos: MovimientoUI[] = useMemo(() => {
  const lista: MovimientoUI[] = [
    ...ingresos.map((i: any) => ({ ...i, monto: i.monto ?? 0, tipo: "Ingreso" as const })),
    ...gastos.map((g: any) => ({ ...g, monto: g.monto ?? 0, tipo: "Gasto" as const })),
  ];

  return lista
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);
}, [ingresos, gastos]);

// ============================
// AHORROS USD
// ============================
const totalUSD = useMemo(
  () => (ahorros ?? []).reduce((acc: number, a: any) => acc + (a.usd ?? 0), 0),
  [ahorros]
);

  // ============================
  // IA
  // ============================
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState<any>(null);

  async function enviarAI() {
    if (!texto.trim()) return;
    setLoading(true);
    try {
      const resp = await fetch("/api/ai-input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });

      const json = await resp.json();
      setRespuesta(json);

      if (json.tipo === "gasto") {
        await agregarGasto({
          descripcion: json.descripcion,
          monto: json.monto,
          fecha: json.fecha,
          categoria: json.categoria,
          tipo: "Gasto",
        });
      }

      if (json.tipo === "ingreso") {
        await agregarIngreso({
          descripcion: json.descripcion,
          monto: json.monto,
          fecha: json.fecha,
          tipo: "Ingreso",
        });
      }

      if (json.tipo === "ahorro") {
        await agregarAhorro({ usd: json.usd, fecha: json.fecha, notas: "Ahorro por IA" });
      }

      if (json.tipo === "compra-usd") {
        await agregarAhorro({ usd: json.usd, fecha: json.fecha, notas: "Compra de dólares" });
      }

      if (json.tipo === "venta-usd") {
        await agregarAhorro({ usd: -json.usd, fecha: json.fecha, notas: "Venta de dólares" });
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

          {/* Lista de deudas */}
          {deudasMes.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Deudas</h3>
              <div className="rounded-xl bg-white/70 shadow-inner divide-y divide-slate-200">
                {deudasMes.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between px-4 py-2 text-sm"
                  >
                    <span className="font-medium text-slate-700">
                      {d.nombre}
                      {d.status === "pospuesto" && (
                        <span className="text-xs text-amber-600">(pospuesto)</span>
                      )}
                    </span>
                    <span className="font-semibold text-slate-800">
                      ${Number(d.monto ?? 0).toLocaleString("es-AR")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de cobros pendientes */}
          {cobrosMes.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold text-emerald-600 mb-2">Cobros pendientes</h3>
              <div className="rounded-xl bg-white/70 shadow-inner divide-y divide-slate-200">
                {cobrosMes.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-4 py-2 text-sm"
                  >
                    <span className="font-medium text-slate-700">
                      {c.nombre}
                    </span>
                    <span className="font-semibold text-emerald-600">
                      ${Number(c.monto ?? 0).toLocaleString("es-AR")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ====================== DERECHA ====================== */}
        <div className="space-y-4">
          {/* OBJETIVOS */}
          <div className="glass-card">
            <h3 className="text-lg font-semibold mb-4">Objetivos del mes</h3>

            {/* Ahorro deseado */}
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

            {/* Gasto ideal */}
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

          {/* AHORRO USD */}
          <div className="glass-card">
            <h3 className="text-lg font-semibold mb-1">Ahorro en dólares</h3>
            <p className="text-sm text-slate-500 mb-4">Total acumulado.</p>
            <p className="text-3xl font-semibold text-slate-900">
              USD {totalUSD.toLocaleString("es-AR")}
            </p>
          </div>

          {/* COSAS POR PAGAR + DISPONIBLE */}
          <div className="grid grid-cols-2 gap-6 w-[95%] mx-auto">
            <WidgetCosasPorPagar />
            <WidgetDisponible />
          </div>
        </div>
      </section>

      {/* ============================ FILA 2 — IA + Finanzas ============================ */}
      <section className="grid gap-6 lg:grid-cols-2">
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
        </div>

        <div className="glass-card">
          <FinanzasDelMes ingresos={ingresos} gastos={gastos} />
        </div>
      </section>

      {/* ============================ FILA 3 — Últimos movimientos ============================ */}
      <section className="glass-card">
        <h2 className="text-lg font-semibold mb-4">Últimos movimientos</h2>
        <div className="space-y-3">
          {movimientos.map((m) => (
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
      </section>
    </div>
  );
}
