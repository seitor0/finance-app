"use client";

import type { Movimiento } from "./types";

export default function TablaMovimientos({
  movimientos,
}: {
  movimientos: Movimiento[];
}) {
  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-3 text-left text-gray-600 text-sm font-semibold">
              Tipo
            </th>
            <th className="p-3 text-left text-gray-600 text-sm font-semibold">
              Descripción
            </th>
            <th className="p-3 text-left text-gray-600 text-sm font-semibold">
              Monto
            </th>
            <th className="p-3 text-left text-gray-600 text-sm font-semibold">
              Fecha
            </th>
          </tr>
        </thead>

        <tbody>
          {movimientos.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="p-4 text-gray-500 text-center italic bg-white"
              >
                No hay movimientos para mostrar.
              </td>
            </tr>
          )}

          {movimientos.map((m) => (
            <tr
              key={m.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              {/* ICONO + BADGE */}
              <td className="p-3">
                <span
                  className={`px-2 py-1 text-xs font-bold rounded-full ${
                    m.tipo === "Ingreso"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {m.tipo}
                </span>
              </td>

              <td className="p-3 text-gray-800">{m.descripcion}</td>

              {/* MONTO */}
              <td
                className={`p-3 font-semibold ${
                  m.tipo === "Ingreso" ? "text-green-600" : "text-red-600"
                }`}
              >
                {m.tipo === "Ingreso" ? "+" : "-"} $
                {m.monto.toLocaleString("es-AR")}
              </td>

              {/* FECHA */}
              <td className="p-3 text-gray-600">{m.fecha}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
