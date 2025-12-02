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
    agregarIngreso,
    agregarGasto,
    agregarAhorro,
    dineroDisponible,
    setDineroDisponible,
  } = useApp();

  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState<any>(null);

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

  return (
    <div className="space-y-8 fade-up">

      {/* FILA 1 */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">

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

          <div className="mt-8">
            <WidgetCosasPorPagar />
          </div>
        </div>

        <div className="glass-card">
          <h3 className="text-lg font-semibold mb-4">Objetivos del mes</h3>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Ahorro deseado</span>
              <span className="font-semibold">
                ${Math.round(totalIngresosMes * 0.2).toLocaleString("es-AR")}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-emerald-500"
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

            <div className="flex items-center justify-between mt-4">
              <span>Gasto ideal</span>
              <span className="font-semibold">
                ${Math.round(totalIngresosMes * 0.5).toLocaleString("es-AR")}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-rose-500"
                style={{
                  width:
                    totalIngresosMes > 0
                      ? `${Math.min(
                          totalGastosMes / (totalIngresosMes * 0.5 || 1) * 100,
                          100
                        )}%`
                      : "0%",
                }}
              />
            </div>
          </div>
        </div>

      </section>

      {/* FILA 2 */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card">
          <h2 className="text-lg font-semibold mb-3">Cargar con IA</h2>

          <p className="text-sm text-slate-500 mb-4">
            Escribí un gasto o ingreso en lenguaje natural y lo interpretamos por vos.
          </p>

          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className="w-full h-28 p-4 rounded-2xl border border-slate-200 bg-white/60 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none text-sm"
            placeholder='Ej: "Hoy gasté 25.000 en el super" o "Cobré 150.000 de diseño"'
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

        <div className="glass-card">
          <FinanzasDelMes ingresos={ingresos} gastos={gastos} />
        </div>
      </section>

      {/* FILA 3 */}
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

          {movimientos.map((m) => (
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
                {m.monto.toLocaleString("es-AR")}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
