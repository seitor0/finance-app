"use client";

import { useMemo } from "react";
import Chart from "./Chart";


const CATEGORIAS_BASE = [
  "Supermercado",
  "Transporte",
  "Servicios",
  "Ropa",
  "Salud",
  "Suscripciones",
  "Otros",
];

type Gasto = {
  fecha: string;
  monto: number | null;
  categoria?: string;
};

type Props = {
  ingresos: any[]; // por ahora no los usamos acá
  gastos: Gasto[];
};

export default function FinanzasDelMes({ ingresos, gastos }: Props) {
  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const añoActual = ahora.getFullYear();

  // GASTOS DEL MES
  const gastosMes = useMemo(
    () =>
      gastos.filter((g) => {
        const f = new Date(g.fecha);
        return (
          f.getMonth() === mesActual && f.getFullYear() === añoActual
        );
      }),
    [gastos, mesActual, añoActual]
  );

  // SUMA POR CATEGORÍA → datos para el gráfico
  const chartData = useMemo(() => {
    const mapa: Record<string, number> = {};

    CATEGORIAS_BASE.forEach((cat) => (mapa[cat] = 0));

    gastosMes.forEach((g) => {
      const cat =
        g.categoria && g.categoria.trim() !== ""
          ? g.categoria
          : "Otros";

      if (!mapa[cat]) mapa[cat] = 0;
      mapa[cat] += g.monto ?? 0;
    });

    // limpiamos categorías en 0 y convertimos a array { name, value }
    return Object.entries(mapa)
      .filter(([, monto]) => monto > 0)
      .map(([name, value]) => ({ name, value }));
  }, [gastosMes]);

  const totalMes = chartData.reduce(
    (acc, item) => acc + item.value,
    0
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Finanzas del mes</h2>

      {chartData.length === 0 ? (
        <p className="text-sm text-slate-500">
          Todavía no hay gastos cargados este mes.
        </p>
      ) : (
        <div className="flex flex-col md:flex-row gap-10">
          {/* Gráfico */}
          <div className="w-full md:w-1/2 h-64">
            <Chart data={chartData} />
          </div>

          {/* Detalle por categoría */}
          <div className="w-full md:w-1/2">
            <h3 className="font-semibold mb-2">Categorías</h3>
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

            <div className="mt-4 pt-4 border-t font-bold">
              Total gastado este mes:{" "}
              {totalMes.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
