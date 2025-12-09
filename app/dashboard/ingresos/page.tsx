"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import type { Movimiento } from "@/context/AppContext";
import FormularioIngreso from "./FormularioIngreso";
import { TableFilters } from "@/components/TableFilters";

export default function IngresosPage() {
  const { ingresos, agregarIngreso, editarIngreso, borrarIngreso } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Movimiento | null>(null);
  const [filters, setFilters] = useState({
    descripcion: "",
    minMonto: "",
    maxMonto: "",
    desde: "",
    hasta: "",
  });

  const filteredIngresos = useMemo(() => {
    return ingresos.filter((item) => {
      const descMatch = filters.descripcion
        ? item.descripcion.toLowerCase().includes(filters.descripcion.toLowerCase())
        : true;

      const minMatch = filters.minMonto ? item.monto >= Number(filters.minMonto) : true;
      const maxMatch = filters.maxMonto ? item.monto <= Number(filters.maxMonto) : true;

      const desdeMatch = filters.desde ? item.fecha >= filters.desde : true;
      const hastaMatch = filters.hasta ? item.fecha <= filters.hasta : true;

      return descMatch && minMatch && maxMatch && desdeMatch && hastaMatch;
    });
  }, [filters, ingresos]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      descripcion: "",
      minMonto: "",
      maxMonto: "",
      desde: "",
      hasta: "",
    });
  };

  const handleSave = (data: Omit<Movimiento, "id">) => {
    const payload: Omit<Movimiento, "id"> = {
      descripcion: data.descripcion,
      monto: Number(data.monto),
      fecha: data.fecha,
      categoria: data.categoria || "General",
      tipo: "Ingreso" as const,
    };

    if (editItem) {
      void editarIngreso(editItem.id, payload);
    } else {
      void agregarIngreso(payload);
    }

    setShowForm(false);
  };

  return (
    <div className="space-y-6 font-[Inter] text-slate-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Ingresos</h1>
          <p className="text-sm text-slate-500">Registrá y administrá tus entradas de dinero.</p>
        </div>

        <button
          onClick={() => {
            setEditItem(null);
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Agregar ingreso
        </button>
      </div>

      <TableFilters
        fields={[
          { key: "descripcion", label: "Descripción", type: "search", placeholder: "Buscar..." },
          { key: "minMonto", label: "Monto mínimo", type: "number", placeholder: "0" },
          { key: "maxMonto", label: "Monto máximo", type: "number", placeholder: "0" },
          { key: "desde", label: "Desde", type: "date" },
          { key: "hasta", label: "Hasta", type: "date" },
        ]}
        values={filters}
        onChange={handleFilterChange}
        onClear={resetFilters}
      />

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Descripción</th>
              <th className="px-4 py-3 text-left">Monto</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {filteredIngresos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  {ingresos.length === 0
                    ? "No hay ingresos cargados."
                    : "No hay ingresos que coincidan con los filtros seleccionados."}
                </td>
              </tr>
            )}

            {filteredIngresos.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3 font-medium text-slate-700">{item.fecha}</td>
                <td className="px-4 py-3">{item.descripcion}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">
                  ${item.monto.toLocaleString("es-AR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        setEditItem(item);
                        setShowForm(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                      onClick={() => borrarIngreso(item.id)}
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
        <FormularioIngreso
          onClose={() => setShowForm(false)}
          editItem={editItem}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
