"use client";

import { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import Chart from "./Chart";

type Gasto = {
  fecha: string;
  monto: number | null;
  categoria?: string;
};

type Props = {
  gastos: Gasto[];
};

export default function FinanzasDelMes({ gastos }: Props) {
  const { categorias } = useApp();
  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const añoActual = ahora.getFullYear();
  const mesNombre = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(ahora);

  const categoriasValidas = useMemo(() => {
    const map = new Map<string, { color?: string }>();
    categorias
      .filter((cat) => cat.tipo === "Gasto")
      .forEach((cat) => {
        const nombre = cat.nombre?.trim();
        if (!nombre) return;
        map.set(nombre, { color: cat.color });
      });
    return map;
  }, [categorias]);

  // ============================
  // FILTRO: GASTOS DEL MES
  // ============================
  const gastosMes = useMemo(() => {
    return gastos.filter((g) => {
      const f = new Date(g.fecha ?? "");
      return (
        !isNaN(f.getTime()) &&
        f.getMonth() === mesActual &&
        f.getFullYear() === añoActual
      );
    });
  }, [gastos, mesActual, añoActual]);

  // ============================
  // SUMA POR CATEGORÍA
  // ============================
  const chartData = useMemo(() => {
    const mapa = new Map<string, number>();

    gastosMes.forEach((g) => {
      const categoria = g.categoria?.trim();
      if (!categoria) return;
      if (!categoriasValidas.has(categoria)) return;

      const actual = mapa.get(categoria) ?? 0;
      mapa.set(categoria, actual + Number(g.monto ?? 0));
    });

    return Array.from(mapa.entries())
      .map(([name, value]) => ({
        name,
        value: Number(value) || 0,
        color: categoriasValidas.get(name)?.color,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [gastosMes, categoriasValidas]);

  // ============================
  // TOTAL DEL MES
  // ============================
  const totalMes = useMemo(() => {
    return chartData.reduce((acc, item) => acc + Number(item.value), 0);
  }, [chartData]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex flex-col gap-1 mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Finanzas del mes</p>
        <h2 className="text-2xl font-semibold text-slate-900">{mesNombre}</h2>
        <p className="text-sm text-slate-500">
          Resumen de tus gastos mensuales según las categorías configuradas.
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
          Todavía no hay gastos de categorías válidas este mes.
        </div>
      ) : (
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* ========== GRÁFICO ========== */}
          <div className="w-full lg:w-1/2 h-64">
            <Chart data={chartData} />
          </div>

          {/* ========== DETALLE POR CATEGORÍA ========== */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="rounded-xl bg-slate-50/70 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Total gastado</p>
              <p className="text-3xl font-semibold text-slate-900">
                {totalMes.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                })}
              </p>
            </div>

            <ul className="space-y-3">
              {chartData.map((item) => {
                const porcentaje = totalMes > 0 ? Math.round((item.value / totalMes) * 100) : 0;
                const color = item.color ?? "#2563eb";
                return (
                  <li
                    key={item.name}
                    className="rounded-xl border border-slate-100 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.08)] bg-white/80"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-white shadow"
                          style={{ backgroundColor: color }}
                          aria-hidden
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">{porcentaje}% del mes</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        {item.value.toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        })}
                      </p>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-slate-100">
                      <span
                        className="block h-full rounded-full transition-all"
                        style={{ width: `${porcentaje}%`, backgroundColor: color }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
