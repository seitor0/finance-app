"use client";

import { useMemo, useState } from "react";
import { Ingreso, Gasto } from "@/context/AppContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type Props = {
  ingresos: Ingreso[];
  gastos: Gasto[];
};

type Periodo = "mes" | "3m" | "12m";

export default function DashboardChart({ ingresos, gastos }: Props) {
  const [periodo, setPeriodo] = useState<Periodo>("mes");

  const data = useMemo(() => {
    const ahora = new Date();
    const limite = new Date(ahora);

    if (periodo === "mes") {
      limite.setMonth(ahora.getMonth() - 0);
    } else if (periodo === "3m") {
      limite.setMonth(ahora.getMonth() - 2);
    } else {
      // 12m
      limite.setFullYear(ahora.getFullYear() - 1);
    }

    type Item = {
      key: string;
      label: string;
      ingresos: number;
      gastos: number;
      orden: number;
    };

    const mapa = new Map<string, Item>();

    const addMovimiento = (
      fechaStr: string,
      monto: number,
      tipo: "ingresos" | "gastos"
    ) => {
      const f = new Date(fechaStr);
      if (isNaN(f.getTime())) return;
      if (f < limite) return;

      const year = f.getFullYear();
      const month = f.getMonth(); // 0-11
      const key = `${year}-${month}`;
      const label = f.toLocaleDateString("es-AR", {
        month: "short",
        year: "2-digit",
      });

      const existente =
        mapa.get(key) ||
        ({
          key,
          label,
          ingresos: 0,
          gastos: 0,
          orden: year * 12 + month,
        } as Item);

      existente[tipo] += monto;
      mapa.set(key, existente);
    };

    ingresos.forEach((i) => addMovimiento(i.fecha, i.monto, "ingresos"));
    gastos.forEach((g) => addMovimiento(g.fecha, g.monto, "gastos"));

    return Array.from(mapa.values())
      .sort((a, b) => a.orden - b.orden)
      .map((item) => ({
        mes: item.label,
        ingresos: item.ingresos,
        gastos: item.gastos,
      }));
  }, [ingresos, gastos, periodo]);

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4 gap-4">
        <h2 className="text-xl font-semibold">Evolución ingresos vs gastos</h2>

        <div className="inline-flex rounded border border-gray-200 bg-white overflow-hidden">
          <button
            onClick={() => setPeriodo("mes")}
            className={`px-3 py-1 text-sm ${
              periodo === "mes" ? "bg-gray-900 text-white" : "text-gray-700"
            }`}
          >
            Este mes
          </button>
          <button
            onClick={() => setPeriodo("3m")}
            className={`px-3 py-1 text-sm border-l border-gray-200 ${
              periodo === "3m" ? "bg-gray-900 text-white" : "text-gray-700"
            }`}
          >
            Últimos 3 meses
          </button>
          <button
            onClick={() => setPeriodo("12m")}
            className={`px-3 py-1 text-sm border-l border-gray-200 ${
              periodo === "12m" ? "bg-gray-900 text-white" : "text-gray-700"
            }`}
          >
            Último año
          </button>
        </div>
      </div>

      <div className="h-72 bg-white rounded shadow p-3">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 text-sm">
            Todavía no hay datos para mostrar en el gráfico.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip
                formatter={(value: any) =>
                  `$ ${Number(value).toLocaleString("es-AR")}`
                }
              />
              <Legend />
              <Bar dataKey="ingresos" name="Ingresos" />
              <Bar dataKey="gastos" name="Gastos" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
