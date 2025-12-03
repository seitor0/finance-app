"use client";

import { useMemo } from "react";
import Chart from "./Chart";

type Gasto = {
  fecha: string;
  monto: number | null;
  categoria?: string;
};

type Props = {
  ingresos: any[];
  gastos: Gasto[];
};

export default function FinanzasDelMes({ gastos }: Props) {
  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const añoActual = ahora.getFullYear();

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
    const mapa: Record<string, number> = {};

    gastosMes.forEach((g) => {
      const categoria =
        g.categoria?.trim() && g.categoria !== ""
          ? g.categoria
          : "Otros";

      if (!mapa[categoria]) mapa[categoria] = 0;

      mapa[categoria] += Number(g.monto ?? 0);
    });

    return Object.entries(mapa)
      .map(([name, value]) => ({
        name,
        value: Number(value) || 0,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [gastosMes]);

  // ============================
  // TOTAL DEL MES
  // ============================
  const totalMes = useMemo(() => {
    return chartData.reduce((acc, item) => acc + Number(item.value), 0);
  }, [chartData]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Finanzas del mes</h2>

      {chartData.length === 0 ? (
        <p className="text-sm text-slate-500">
          Todavía no hay gastos cargados este mes.
        </p>
      ) : (
        <div className="flex flex-col md:flex-row gap-10">
          {/* ========== GRÁFICO ========== */}
          <div className="w-full md:w-1/2 h-64">
            <Chart data={chartData} />
          </div>

          {/* ========== DETALLE POR CATEGORÍA ========== */}
          <div className="w-full md:w-1/2">
            <h3 className="font-semibold mb-3">Categorías</h3>

            <ul className="space-y-2">
              {chartData.map((item, idx) => (
                <li
                  key={idx}
                  className="flex justify-between border-b pb-1 text-sm"
                >
                  <span>{item.name}</span>
                  <span className="font-semibold">
                    ${item.value.toLocaleString("es-AR")}
                  </span>
                </li>
              ))}
            </ul>

            {/* TOTAL */}
            <div className="mt-4 pt-4 border-t font-bold text-sm">
              Total gastado este mes:{" "}
              <span className="text-slate-800">
                {totalMes.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
