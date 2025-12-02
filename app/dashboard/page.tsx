"use client";

import { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";

import AppleRings from "./_components/AppleRings";
import FinanzasDelMes from "./_components/FinanzasDelMes";
import WidgetCosasPorPagar from "./_components/WidgetCosasPorPagar";
import FormularioAhorro from "./ahorros/FormularioAhorro";

type MovimientoUI = {
  id: string;
  descripcion: string;
  monto: number;
  fecha: string;
  tipo: "Ingreso" | "Gasto";
};

export default function DashboardPage() {
  const {
    ingresos,
    gastos,
    ahorros,
    agregarIngreso,
    agregarGasto,
    agregarAhorro,
    dineroDisponible,
    setDineroDisponible,
  } = useApp();

  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState<any>(null);

  const [showAhorro, setShowAhorro] = useState(false); // ✔ nuevo

  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const añoActual = ahora.getFullYear();

  const totalIngresosMes = useMemo(
    () =>
      ingresos
        .filter((i) => {
          const f = new Date(i.fecha);
          return f.getMonth() === mesActual && f.getFullYear() === añoActual;
        })
        .reduce((acc, i) => acc + i.monto, 0),
    [ingresos, mesActual, añoActual]
  );

  const totalGastosMes = useMemo(
    () =>
      gastos
        .filter((g) => {
          const f = new Date(g.fecha);
          return f.getMonth() === mesActual && f.getFullYear() === añoActual;
        })
        .reduce((acc, g) => acc + g.monto, 0),
    [gastos, mesActual, añoActual]
  );

  const balanceMes = totalIngresosMes - totalGastosMes;

  const movimientos: MovimientoUI[] = useMemo(() => {
    return [
      ...ingresos.map((i) => ({ ...i, tipo: "Ingreso" as const })),
      ...gastos.map((g) => ({ ...g, tipo: "Gasto" as const })),
    ]
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 5);
  }, [ingresos, gastos]);

  // ========================
  // IA INPUT
  // ========================
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
          notas: "Ahorro IA",
        });
      }

      if (json.tipo === "compra-usd") {
        agregarAhorro({
          usd: json.usd,
          fecha: json.fecha,
          notas: "Compra USD",
        });
        setDineroDisponible(dineroDisponible - json.arsGasto);
      }

      if (json.tipo === "venta-usd") {
        agregarAhorro({
          usd: -json.usd,
          fecha: json.fecha,
          notas: "Venta USD",
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

  return (
    <div className="space-y-8 fade-up">

      {/* FILA 1 */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">

        {/* BALANCE */}
        <div className="glass-card col-span-2">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                Este mes
              </p>
              <h2 className="text-2xl font-semibold tracking-tight mt-1">
                Balance general
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Ingresos, gastos y ahorro actual.
              </p>
            </div>

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

          <AppleRings ingresosMes={totalIngresosMes} gastosMes={totalGastosMes} />

          <div className="mt-6">
            <WidgetCosasPorPagar />
          </div>
        </div>

        {/* OBJETIVOS */}
        <div className="glass-card">
          <h3 className="text-lg font-semibold mb-4">Objetivos del mes</h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Ahorro deseado</span>
              <span className="font-semibold">
                ${Math.round(totalIngresosMes * 0.2).toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          <button
            className="mt-4 w-full text-sm bg-slate-900 text-white py-2 rounded-xl"
            onClick={() => setShowAhorro(true)}
          >
            Registrar ahorro rápido
          </button>
        </div>

        {/* AHORRO RÁPIDO */}
        {showAhorro && (
          <div className="glass-card">
            <FormularioAhorro
              onClose={() => setShowAhorro(false)}
              onSuccess={() => setShowAhorro(false)}
            />
          </div>
        )}
      </section>

      {/* FILA 2 */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card">
          <h2 className="text-lg font-semibold mb-3">Cargar con IA</h2>

          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="w-full h-28 p-4 rounded-2xl border bg-white"
          />

          <button
            onClick={enviarAI}
            disabled={loading}
            className="mt-4 w-full bg-blue-600 text-white py-3 rounded-2xl"
          >
            {loading ? "Procesando..." : "Enviar a la IA"}
          </button>

          {respuesta && (
            <div className="mt-4 p-3 bg-blue-50 border rounded-xl text-xs font-mono">
              <pre>{JSON.stringify(respuesta, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="glass-card">
          <FinanzasDelMes ingresos={ingresos} gastos={gastos} />
        </div>
      </section>

      {/* FILA 3 */}
      <section className="glass-card">
        <h2 className="text-lg font-semibold mb-4">
          Últimos movimientos
        </h2>

        <div className="space-y-3">
          {movimientos.length === 0 && (
            <p className="text-sm text-slate-500">
              Todavía no registraste movimientos este mes.
            </p>
          )}

          {movimientos.map((m) => (
            <div
              key={m.id}
              className={`relative rounded-2xl p-4 flex justify-between text-white ${
                m.tipo === "Ingreso"
                  ? "bg-emerald-500"
                  : "bg-rose-500"
              }`}
            >
              <div>
                <p className="text-xs uppercase opacity-80">{m.tipo}</p>
                <p className="text-sm font-semibold">{m.descripcion}</p>
                <p className="text-[11px] opacity-80">
                  {new Date(m.fecha).toLocaleDateString("es-AR")}
                </p>
              </div>

              <p className="text-lg font-semibold">
                {m.tipo === "Ingreso" ? "+" : "-"}$
                {m.monto.toLocaleString("es-AR")}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
