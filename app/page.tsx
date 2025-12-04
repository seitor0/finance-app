"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import AppleRings from "@/app/dashboard/_components/AppleRings";
import FinanzasDelMes from "@/app/dashboard/_components/FinanzasDelMes";
import WidgetCosasPorPagar from "@/app/dashboard/_components/WidgetCosasPorPagar";
import WidgetDisponible from "@/app/dashboard/_components/WidgetDisponible";



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
    cosasPorCobrar,
    agregarIngreso,
    agregarGasto,
    agregarAhorro,
  } = useApp();

  // ============================
  // FECHA + FILTROS
  // ============================
  const ahora = new Date();
  const añoActual = ahora.getFullYear();
  const mesActualNumero = ahora.getMonth() + 1;
  const mesActualKey = `${añoActual}-${String(mesActualNumero).padStart(2, "0")}`;

  // ============================
  // CALCULOS
  // ============================
  const totalIngresosMes = useMemo(
    () =>
      ingresos
        .filter((i) => (i.fecha ?? "").startsWith(mesActualKey))
        .reduce((acc, i) => acc + Number(i.monto ?? 0), 0),
    [ingresos, mesActualKey]
  );

  const totalGastosMes = useMemo(
    () =>
      gastos
        .filter((g) => (g.fecha ?? "").startsWith(mesActualKey))
        .reduce((acc, g) => acc + Number(g.monto ?? 0), 0),
    [gastos, mesActualKey]
  );

  const deudasMes = useMemo(
    () =>
      cosasPorPagar.filter(
        (c) =>
          (c.status === "falta" || c.status === "pospuesto") &&
          (!(c.vencimiento ?? "") || (c.vencimiento ?? "").startsWith(mesActualKey))
      ),
    [cosasPorPagar, mesActualKey]
  );

  const totalDeudasMes = deudasMes.reduce(
    (acc, c) => acc + Number(c.monto ?? 0),
    0
  );

  const cobrosMes = useMemo(
    () =>
      cosasPorCobrar.filter(
        (c) =>
          c.status !== "cobrado" &&
          (!(c.vencimiento ?? "") || (c.vencimiento ?? "").startsWith(mesActualKey))
      ),
    [cosasPorCobrar, mesActualKey]
  );

  const totalCobrosPendientes = cobrosMes.reduce(
    (acc, c) => acc + Number(c.monto ?? 0),
    0
  );

  const ahorroRealMes = Math.max(totalIngresosMes - totalGastosMes, 0);
  const ahorroDeseado = totalIngresosMes * 0.2;
  const gastoIdeal = totalIngresosMes * 0.5;

  const movimientos = useMemo<MovimientoUI[]>(() => {
  const lista = [
    ...ingresos.map((i): MovimientoUI => ({
      id: i.id,
      descripcion: i.descripcion,
      monto: i.monto ?? 0,
      fecha: i.fecha,
      tipo: "Ingreso",
    })),
    ...gastos.map((g): MovimientoUI => ({
      id: g.id,
      descripcion: g.descripcion,
      monto: g.monto ?? 0,
      fecha: g.fecha,
      tipo: "Gasto",
    })),
  ];

  return lista
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 5);
}, [ingresos, gastos]);


  const totalUSD = (ahorros ?? []).reduce(
    (acc, a) => acc + (a.usd ?? 0),
    0
  );

  // ============================
  // IA
  // ============================
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);

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

      if (json.tipo === "gasto") {
        await agregarGasto(json);
      } else if (json.tipo === "ingreso") {
        await agregarIngreso(json);
      } else if (json.tipo === "ahorro" || json.tipo === "compra-usd" || json.tipo === "venta-usd") {
        await agregarAhorro({
          usd: json.usd,
          fecha: json.fecha,
          notas: json.notas ?? "Actualizado por IA",
        });
      }
    } finally {
      setLoading(false);
      setTexto("");
    }
  }

  // ============================
  // MOBILE LITE
  // ============================
  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  if (isMobile) {
    return (
      <div className="space-y-6 p-4 fade-up">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-xl font-semibold mb-2">Balance del mes</h2>

          <p className="text-4xl font-bold text-slate-900">
            ${(totalIngresosMes - totalGastosMes).toLocaleString("es-AR")}
          </p>

          <div className="mt-4">
            <AppleRings
              ingresosMes={totalIngresosMes}
              gastosMes={totalGastosMes}
              pendientesMes={totalDeudasMes}
              cobrosPendientes={totalCobrosPendientes}
            />
          </div>
        </motion.div>

        {/* IA Chat iMessage */}
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-3">Añadir con IA</h3>

          <div className="rounded-2xl bg-white p-2 shadow-inner">
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder='Ej: "Pagé 20.000 del super"'
              className="w-full h-24 p-3 rounded-xl focus:outline-none"
            />
            <button
              onClick={enviarAI}
              disabled={loading}
              className="w-full mt-2 bg-blue-600 text-white py-3 rounded-xl"
            >
              {loading ? "Procesando..." : "Enviar"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // DESKTOP UI
  // ============================
  return (
    <div className="space-y-10 fade-up">

      {/* FILA 1 */}
      <section className="grid grid-cols-1 lg:grid-cols-[2fr_1.4fr] gap-8">

        {/* BALANCE + RINGS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8"
        >
          <h2 className="text-2xl font-semibold mb-2">Balance general</h2>
          <p className="text-slate-500 mb-6">Ingresos, gastos, pendientes y cobros.</p>

          <AppleRings
            ingresosMes={totalIngresosMes}
            gastosMes={totalGastosMes}
            pendientesMes={totalDeudasMes}
            cobrosPendientes={totalCobrosPendientes}
          />

          {/* DEUDAS LIST */}
          {deudasMes.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-slate-700 mb-2">Deudas</h3>
              <div className="rounded-xl bg-white/70 divide-y divide-slate-200 shadow-inner">
                {deudasMes.map((d) => (
                  <div key={d.id} className="flex justify-between p-3 text-sm">
                    <span>{d.nombre}</span>
                    <strong>${d.monto.toLocaleString("es-AR")}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COBROS LIST */}
          {cobrosMes.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-emerald-600 mb-2">Cobros pendientes</h3>
              <div className="rounded-xl bg-white/70 divide-y divide-slate-200 shadow-inner">
                {cobrosMes.map((c) => (
                  <div key={c.id} className="flex justify-between p-3 text-sm">
                    <span>{c.nombre}</span>
                    <strong className="text-emerald-600">
                      ${c.monto.toLocaleString("es-AR")}
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* OBJETIVOS + USD + WIDGETS */}
        <div className="space-y-6">
          {/* OBJETIVOS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold mb-4">Objetivos del mes</h3>

            <div className="text-sm flex justify-between mb-1">
              <span>Ahorro deseado</span>
              <strong>${Math.round(ahorroDeseado).toLocaleString("es-AR")}</strong>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mb-4">
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${Math.min((ahorroRealMes / ahorroDeseado) * 100, 100)}%`,
                }}
              />
            </div>

            <div className="text-sm flex justify-between mb-1">
              <span>Gasto ideal</span>
              <strong>${Math.round(gastoIdeal).toLocaleString("es-AR")}</strong>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-rose-500"
                style={{
                  width: `${Math.min((totalGastosMes / gastoIdeal) * 100, 100)}%`,
                }}
              />
            </div>
          </motion.div>

          {/* USD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold mb-1">Ahorro en dólares</h3>
            <p className="text-sm text-slate-500 mb-4">Total acumulado.</p>
            <p className="text-3xl font-semibold text-slate-900">
              USD {totalUSD.toLocaleString("es-AR")}
            </p>
          </motion.div>

          {/* COSAS POR PAGAR + DISPONIBLE */}
          <div className="grid grid-cols-2 gap-6">
            <WidgetCosasPorPagar />
            <WidgetDisponible />
          </div>
        </div>
      </section>

      {/* IA + FINANZAS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* IA CHAT */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold mb-3">Cargar con IA</h2>

          <div className="bg-white rounded-2xl shadow-inner p-3">
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder='Ej: "Gasté 20.000 en el super"'
              className="w-full h-28 p-3 rounded-xl focus:outline-none text-sm"
            />
            <button
              onClick={enviarAI}
              disabled={loading}
              className="mt-3 bg-blue-600 text-white py-3 rounded-xl w-full"
            >
              {loading ? "Procesando..." : "Enviar"}
            </button>
          </div>
        </motion.div>

        {/* FINANZAS DEL MES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <FinanzasDelMes ingresos={ingresos} gastos={gastos} />
        </motion.div>
      </section>

      {/* ÚLTIMOS MOVIMIENTOS */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold mb-4">Últimos movimientos</h2>

        <div className="space-y-3">
          {movimientos.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-2xl p-4 flex items-center justify-between text-white shadow-lg bg-gradient-to-r ${
                m.tipo === "Ingreso"
                  ? "from-emerald-500 via-emerald-400 to-emerald-600"
                  : "from-rose-500 via-rose-400 to-rose-600"
              }`}
            >
              <div>
                <p className="text-xs opacity-90">{m.tipo}</p>
                <p className="text-sm font-semibold">{m.descripcion}</p>
                <p className="text-[10px] opacity-80 mt-1">
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
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
