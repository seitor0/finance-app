"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORES = [
  "#4CAF50", // verde
  "#1560DD", // azul
  "#FF9800", // naranja
  "#F44336", // rojo
  "#9C27B0", // violeta
  "#607D8B", // gris verdoso
  "#795548", // marrón
];

const CATEGORIAS_BASE = [
  "Supermercado",
  "Transporte",
  "Servicios",
  "Ropa",
  "Salud",
  "Suscripciones",
  "Otros",
];

export default function FinanzasDelMes({ ingresos, gastos }: any) {
  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const añoActual = ahora.getFullYear();

  /* ------------------------------------------------------ */
  /* FILTRAR GASTOS DEL MES */
  /* ------------------------------------------------------ */
  const gastosMes = gastos.filter((g: any) => {
    const f = new Date(g.fecha);
    return f.getMonth() === mesActual && f.getFullYear() === añoActual;
  });

  /* ------------------------------------------------------ */
  /* SUMAR POR CATEGORÍA (con categorías base + nuevas) */
  /* ------------------------------------------------------ */
  const categoriaMap = useMemo(() => {
    const mapa: Record<string, number> = {};

    // incluir base
    CATEGORIAS_BASE.forEach((cat) => (mapa[cat] = 0));

    // sumar gastos
    gastosMes.forEach((g: any) => {
      const cat =
        g.categoria && g.categoria.trim() !== ""
          ? g.categoria
          : "Otros";

      if (!mapa[cat]) mapa[cat] = 0; // categoría nueva
      mapa[cat] += g.monto;
    });

    return Object.entries(mapa).map(([categoria, monto]) => ({
      categoria,
      monto,
    }));
  }, [gastosMes]);

  /* ------------------------------------------------------ */
  /* TOTALES */
  /* ------------------------------------------------------ */
  const totalMes = categoriaMap.reduce((acc, item) => acc + item.monto, 0);

  /* ------------------------------------------------------ */
  /* UI */
  /* ------------------------------------------------------ */
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Finanzas del mes</h2>

      <div className="flex flex-col md:flex-row gap-10">
        
        {/* PIE CHART */}
        <div className="w-full md:w-1/2 h-64">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={categoriaMap}
                dataKey="monto"
                nameKey="categoria"
                outerRadius={90}
                fill="#8884d8"
                label
              >
                {categoriaMap.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORES[index % COLORES.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* DETALLES */}
        <div className="w-full md:w-1/2">
          <h3 className="font-semibold mb-2">Categorías</h3>
          <ul className="space-y-2">
            {categoriaMap.map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between border-b pb-1"
              >
                <span>{item.categoria}</span>
                <span className="font-semibold">
                  ${item.monto.toLocaleString("es-AR")}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t font-bold">
            Total gastado este mes: ${totalMes.toLocaleString("es-AR")}
          </div>
        </div>

      </div>
    </div>
  );
}
