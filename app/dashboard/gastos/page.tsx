"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import FormularioGasto from "./FormularioGasto";
import "@/styles/gastos.css";
import { TableFilters } from "@/components/TableFilters";

export default function GastosPage() {
  const { gastos, agregarGasto, editarGasto, borrarGasto } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filters, setFilters] = useState({
    descripcion: "",
    categoria: "",
    minMonto: "",
    maxMonto: "",
    desde: "",
    hasta: "",
  });

  const categorias = useMemo(() => {
    const valores = new Set<string>();
    gastos.forEach((g) => {
      if (g.categoria) valores.add(g.categoria);
    });
    return Array.from(valores).sort((a, b) => a.localeCompare(b));
  }, [gastos]);

  const filteredGastos = useMemo(() => {
    return gastos.filter((item) => {
      const descMatch = filters.descripcion
        ? item.descripcion.toLowerCase().includes(filters.descripcion.toLowerCase())
        : true;
      const categoriaMatch = filters.categoria ? item.categoria === filters.categoria : true;
      const minMatch = filters.minMonto ? item.monto >= Number(filters.minMonto) : true;
      const maxMatch = filters.maxMonto ? item.monto <= Number(filters.maxMonto) : true;
      const desdeMatch = filters.desde ? item.fecha >= filters.desde : true;
      const hastaMatch = filters.hasta ? item.fecha <= filters.hasta : true;

      return descMatch && categoriaMatch && minMatch && maxMatch && desdeMatch && hastaMatch;
    });
  }, [filters, gastos]);

  const resetFilters = () => {
    setFilters({
      descripcion: "",
      categoria: "",
      minMonto: "",
      maxMonto: "",
      desde: "",
      hasta: "",
    });
  };

  return (
    <div className="space-y-6 font-[Inter] text-slate-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Gastos</h1>
          <p className="text-sm text-slate-500">Controlá tus egresos y mantené todo al día.</p>
        </div>

        <button
          onClick={() => {
            setEditItem(null);
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Agregar gasto
        </button>
      </div>

      <TableFilters
        fields={[
          { key: "descripcion", label: "Descripción", type: "search", placeholder: "Buscar..." },
          {
            key: "categoria",
            label: "Categoría",
            type: "select",
            options: categorias.map((cat) => ({ value: cat, label: cat })),
            emptyOptionLabel: "Todas",
          },
          { key: "minMonto", label: "Monto mínimo", type: "number", placeholder: "0" },
          { key: "maxMonto", label: "Monto máximo", type: "number", placeholder: "0" },
          { key: "desde", label: "Desde", type: "date" },
          { key: "hasta", label: "Hasta", type: "date" },
        ]}
        values={filters}
        onChange={(key, value) => setFilters((prev) => ({ ...prev, [key]: value }))}
        onClear={resetFilters}
      />

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Categoría</th>
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-left">Monto</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {filteredGastos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  {gastos.length === 0
                    ? "No hay gastos registrados."
                    : "No encontramos gastos con estos filtros."}
                </td>
              </tr>
            )}

            {filteredGastos.map((g) => (
              <tr key={g.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3 font-medium text-slate-700">{g.fecha}</td>
                <td className="px-4 py-3">{g.categoria || "—"}</td>
                <td className="px-4 py-3">{g.descripcion}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">
                  {g.monto ? `$${Number(g.monto).toLocaleString("es-AR")}` : "$0"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        setEditItem(g);
                        setShowForm(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                      onClick={() => borrarGasto(g.id)}
                    >
                      Borrar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <FormularioGasto
          editItem={editItem}
          onClose={() => setShowForm(false)}
          onSave={(data) => {
            if (editItem) {
              editarGasto(editItem.id, data);
            } else {
              agregarGasto({ ...data, tipo: "Gasto" as const });
            }
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
