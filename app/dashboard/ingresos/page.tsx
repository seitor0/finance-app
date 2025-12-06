"use client";

import { useApp } from "@/context/AppContext";
import type { Movimiento } from "@/context/AppContext";
import { useState } from "react";
import FormularioIngreso from "./FormularioIngreso";

export default function IngresosPage() {
  const { ingresos, agregarIngreso, editarIngreso, borrarIngreso } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const handleSave = (data: any) => {
    const payload: Omit<Movimiento, "id"> = {
      descripcion: data.descripcion,
      monto: Number(data.monto),
      fecha: data.fecha,
      categoria: data.categoria || "General",
      tipo: "Ingreso",
    };

    if (editItem) {
      editarIngreso(editItem.id, payload);
    } else {
      agregarIngreso(payload);
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
            {ingresos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  No hay ingresos cargados.
                </td>
              </tr>
            )}

            {ingresos.map((item) => (
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
