"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import FormularioAhorro from "./FormularioAhorro";
import { TableFilters } from "@/components/TableFilters";

export default function AhorrosPage() {
  const { ahorros, borrarAhorro } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({
    notas: "",
    minUsd: "",
    maxUsd: "",
    desde: "",
    hasta: "",
  });

  const totalUSD = ahorros.reduce((acc, a) => acc + a.usd, 0);
  const filteredAhorros = ahorros.filter((item) => {
    const notasMatch = filters.notas
      ? (item.notas || "").toLowerCase().includes(filters.notas.toLowerCase())
      : true;
    const minMatch = filters.minUsd ? item.usd >= Number(filters.minUsd) : true;
    const maxMatch = filters.maxUsd ? item.usd <= Number(filters.maxUsd) : true;
    const desdeMatch = filters.desde ? item.fecha >= filters.desde : true;
    const hastaMatch = filters.hasta ? item.fecha <= filters.hasta : true;

    return notasMatch && minMatch && maxMatch && desdeMatch && hastaMatch;
  });

  const resetFilters = () => {
    setFilters({
      notas: "",
      minUsd: "",
      maxUsd: "",
      desde: "",
      hasta: "",
    });
  };

  return (
    <div className="space-y-6 font-[Inter] text-slate-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Ahorros en USD</h1>
          <p className="text-sm text-slate-500">Seguimiento de tus dólares ahorrados.</p>
        </div>

        <button
          onClick={() => {
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Nuevo ahorro
        </button>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Total acumulado</p>
        <h2 className="text-4xl font-bold text-emerald-600">
          USD {totalUSD.toLocaleString("es-AR")}
        </h2>
      </div>

      <TableFilters
        fields={[
          { key: "notas", label: "Notas", type: "search", placeholder: "Palabras clave..." },
          { key: "minUsd", label: "USD mínimos", type: "number", placeholder: "0" },
          { key: "maxUsd", label: "USD máximos", type: "number", placeholder: "0" },
          { key: "desde", label: "Desde", type: "date" },
          { key: "hasta", label: "Hasta", type: "date" },
        ]}
        values={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onClear={resetFilters}
      />

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        {filteredAhorros.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">
            {ahorros.length === 0
              ? "Todavía no registraste ahorros."
              : "No se encontraron ahorros con esos filtros."}
          </p>
        ) : (
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Monto (USD)</th>
                <th className="px-4 py-3 text-left">Notas</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              {filteredAhorros.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-slate-700">{a.fecha}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">USD {a.usd}</td>
                  <td className="px-4 py-3">{a.notas || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setShowForm(true);
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => borrarAhorro(a.id)}
                        className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                      >
                        Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <FormularioAhorro
            onClose={() => {
              setShowForm(false);
            }}
            onSuccess={() => {
              setShowForm(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
