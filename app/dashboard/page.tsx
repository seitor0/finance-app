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
    agregarIngreso,
    agregarGasto,
    agregarAhorro,
    dineroDisponible,
    setDineroDisponible,
  } = useApp();

  // ======================
  // 🧠 FECHA ACTUAL + KEY DEL MES: "YYYY-MM"
  // ======================
  const ahora = new Date();
  const añoActual = ahora.getFullYear();
  const mesActualNumero = ahora.getMonth() + 1; // 1..12
  const mesActualKey = `${añoActual}-${String(mesActualNumero).padStart(2, "0")}`; // → "2025-12"

  // ======================
  // 🧮 INGRESOS DEL MES
  // ======================
  const totalIngresosMes = useMemo(
    () =>
      ingresos
        .filter((i: any) => i.fecha?.startsWith(mesActualKey))
        .reduce((acc: number, i: any) => acc + Number(i.monto ?? 0), 0),
    [ingresos, mesActualKey]
  );

  // ======================
  // 🧮 GASTOS DEL MES
  // ======================
  const totalGastosMes = useMemo(
    () =>
      gastos
        .filter((g: any) => g.fecha?.startsWith(mesActualKey))
        .reduce((acc: number, g: any) => acc + Number(g.monto ?? 0), 0),
    [gastos, mesActualKey]
  );

  // ======================
  // 🧮 PENDIENTES DEL MES
  // ======================
  const totalPendientesMes = useMemo(
    () =>
      cosasPorPagar
        .filter(
          (c: any) =>
            c.status === "falta" &&
            (!c.vencimiento || String(c.vencimiento).startsWith(mesActualKey))
        )
        .reduce((acc: number, c: any) => acc + Number(c.monto ?? 0), 0),
    [cosasPorPagar, mesActualKey]
  );

  // ======================
  // 🧮 BALANCE FINAL DEL MES
  // ======================
  const balanceMes = totalIngresosMes - totalGastosMes - totalPendientesMes;

  // ======================
  // LISTA DE MOVIMIENTOS (últimos 5)
  // ======================
  const movimientos: MovimientoUI[] = useMemo(() => {
    const lista: MovimientoUI[] = [
      ...ingresos.map((i: any) => ({
        ...i,
        monto: i.monto ?? 0,
        tipo: "Ingreso" as const,
      })),
      ...gastos.map((g: any) => ({
        ...g,
        monto: g.monto ?? 0,
        tipo: "Gasto" as const,
      })),
    ];

    return lista
      .sort(
        (a, b) =>
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      )
      .slice(0, 5);
  }, [ingresos, gastos]);

  // ======================
  // AHORROS USD TOTAL
  // ======================
  const totalUSD = useMemo(
    () =>
      (ahorros ?? []).reduce(
        (acc: number, a: any) => acc + (a.usd ?? 0),
        0
      ),
    [ahorros]
  );

  // ======================
  // IA PARA INGRESOS/GASTOS
  // ======================
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
        agregarGasto({
          descripcion: json.descripcion,
          monto: json.monto,
          fecha: json.fecha,
        });
      }

      if (json.tipo === "ingreso") {
        agregarIngreso({
          descripcion: json.descripcion,
          monto: json.monto,
          fecha: json.fecha,
        });
      }

      if (json.tipo === "ahorro") {
        agregarAhorro({
          usd: json.usd,
          fecha: json.fecha,
          notas: "Ahorro por IA",
        });
      }

      if (json.tipo === "compra-usd") {
        agregarAhorro({
          usd: json.usd,
          fecha: json.fecha,
          notas: "Compra de dólares",
        });
        setDineroDisponible(dineroDisponible - json.arsGasto);
      }

      if (json.tipo === "venta-usd") {
        agregarAhorro({
          usd: -json.usd,
          fecha: json.fecha,
          notas: "Venta de dólares",
        });
        setDineroDisponible(dineroDisponible + json.arsIngreso);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setTexto("");
    }
  }

  // ==========================================================
  // =====================     RENDER     ====================
  // ==========================================================
  return (
    <div className="space-y-8 fade-up">
      
      {/* FILA 1: resumen + objetivos + ahorro */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        
        {/* RESUMEN IZQUIERDA */}
        <div className="glass-card">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Este mes
              </p>
              <h2 className="text-2xl font-semibold tracking-tight mt-1">
                Balance general
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Ingresos, gastos, pendientes y ahorro actual.
              </p>
            </div>

            {/* BALANCE NUMÉRICO */}
            <div className="text-right">
              <p className="text-xs text-slate-400">Balance</p>
              <p
                className={`text-3xl font-semibold ${
                  balanceMes >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {balanceMes >= 0 ? "+" : "-"}$
                {Math.abs(balanceMes).toLocaleString("es-AR")}
              </p>
            </div>
          </div>

          {/* ANILLOS */}
          <AppleRings
            ingresosMes={totalIngresosMes}
            gastosMes={totalGastosMes}
            pendientesMes={totalPendientesMes}
          />

          {/* Lista mini de pendientes */}
          <div className="mt-8">
            <WidgetCosasPorPagar />
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-4">
          {/* OBJETIVOS */}
          <div className="glass-card">
            <h3 className="text-lg font-semibold mb-4">
              Objetivos del mes
            </h3>

            <div className="space-y-3 text-sm">
              {/* Ahorro ideal */}
              <div className="flex items-center justify-between">
                <span>Ahorro deseado</span>
                <span className="font-semibold">
                  ${(Math.round(totalIngresosMes * 0.2)).toLocaleString("es-AR")}
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{
                    width:
                      totalIngresosMes > 0
                        ? `${Math.min(
                            Math.max(balanceMes, 0) /
                              (totalIngresosMes * 0.2 || 1) *
                              100,
                            100
                          )}%`
                        : "0%",
                  }}
                />
              </div>

              {/* Gasto ideal */}
              <div className="flex items-center justify-between mt-4">
                <span>Gasto ideal</span>
                <span className="font-semibold">
                  ${(Math.round(totalIngresosMes * 0.5)).toLocaleString("es-AR")}
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all"
                  style={{
                    width:
                      totalIngresosMes > 0
                        ? `${Math.min(
                            totalGastosMes /
                              (totalIngresosMes * 0.5 || 1) *
                              100,
                            100
                          )}%`
                        : "0%",
                  }}
                />
              </div>
            </div>
          </div>

          {/* AHORRO USD */}
          <div className="glass-card">
            <h3 className="text-lg font-semibold mb-1">
              Ahorro en dólares
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Total acumulado en tus ahorros.
            </p>
            <p className="text-3xl font-semibold text-slate-900">
              USD {totalUSD.toLocaleString("es-AR")}
            </p>
          </div>

          {/* WIDGETS ABAJO */}
          <div className="grid grid-cols-3 gap-4">
            <WidgetCosasPorPagar />
            <WidgetDisponible />
          </div>
        </div>
      </section>

      {/* ================================================
          FILA 2: IA + Finanzas del mes
      ================================================ */}
      <section className="grid gap-6 lg:grid-cols-2">
        
        {/* IA */}
        <div className="glass-card">
          <h2 className="text-lg font-semibold mb-3">Cargar con IA</h2>
          <p className="text-sm text-slate-500 mb-4">
            Escribí un gasto o ingreso y lo interpretamos por vos.
          </p>

          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="w-full h-28 p-4 rounded-2xl border border-slate-200 bg-white/60 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none text-sm"
            placeholder='Ej: "Hoy gasté 25.000 en el super" o "Cobré 150.000 por diseño"'
          />

          <button
            onClick={enviarAI}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-2xl font-medium disabled:opacity-60"
          >
            {loading ? "Procesando..." : "Enviar a la IA"}
          </button>

          {respuesta && (
            <div className="mt-4 p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs font-mono">
              <pre>{JSON.stringify(respuesta, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Finanzas del mes */}
        <div className="glass-card">
          <FinanzasDelMes ingresos={ingresos} gastos={gastos} />
        </div>
      </section>

      {/* ================================================
          FILA 3: ÚLTIMOS MOVIMIENTOS
      ================================================ */}
      <section className="glass-card">
        <h2 className="text-lg font-semibold mb-4">
          Últimos movimientos (vista tarjeta)
        </h2>

        <div className="space-y-3">
          {movimientos.length === 0 && (
            <p className="text-sm text-slate-500">
              Todavía no registraste movimientos este mes.
            </p>
          )}

          {movimientos.map((m) => {
            const monto =
              m.monto ??
              (m as any).arsIngreso ??
              (m as any).arsGasto ??
              0;

            return (
              <div
                key={m.id}
                className={`relative overflow-hidden rounded-2xl p-4 flex items-center justify-between bg-gradient-to-r ${
                  m.tipo === "Ingreso"
                    ? "from-emerald-500/80 via-emerald-400/80 to-emerald-500/80"
                    : "from-rose-500/80 via-rose-400/80 to-rose-500/80"
                } text-white shadow-md`}
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] opacity-80">
                    {m.tipo}
                  </p>
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
                  {monto.toLocaleString("es-AR")}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
