"use client";

import { useState } from "react";
import { useApp, type ToPayItem } from "@/context/AppContext";
import FormPorPagar from "./FormPorPagar";

export default function CosasPorPagarPage() {
  const {
    cosasPorPagar,
    agregarCosaPorPagar,
    cambiarEstadoPago,
    editarCosaPorPagar,
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<ToPayItem | null>(null);

  return (
    <div className="space-y-6 font-[Inter] text-slate-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Cosas por pagar</h1>
          <p className="text-sm text-slate-500">Seguí de cerca tus pagos pendientes.</p>
        </div>

        <button
          onClick={() => {
            setEditItem(null);
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Agregar pago pendiente
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Categoría</th>
              <th className="px-4 py-3 text-left">Monto</th>
              <th className="px-4 py-3 text-left">Vencimiento</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-600">
            {cosasPorPagar.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No hay pagos pendientes.
                </td>
              </tr>
            )}

            {cosasPorPagar.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3 font-medium text-slate-700">{item.nombre}</td>
                <td className="px-4 py-3">{item.categoria || "—"}</td>
                <td className="px-4 py-3 font-semibold text-rose-600">
                  ${item.monto.toLocaleString("es-AR")}
                </td>
                <td className="px-4 py-3">{item.vencimiento || "—"}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold capitalize">
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {item.status !== "pagado" && (
                      <button
                        className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-100"
                        onClick={() => cambiarEstadoPago(item.id, "pagado")}
                      >
                        Marcar pagado
                      </button>
                    )}
                    <button
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        setEditItem(item);
                        setShowForm(true);
                      }}
                    >
                      Editar
                    </button>
                    {item.status !== "pospuesto" && (
                      <button
                        className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-100"
                        onClick={() => cambiarEstadoPago(item.id, "pospuesto")}
                      >
                        Posponer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <FormPorPagar
          editItem={editItem}
          onClose={() => setShowForm(false)}
          onSave={async (data) => {
            if (editItem) {
              await editarCosaPorPagar(editItem.id, data);
            } else {
              await agregarCosaPorPagar(data);
            }
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
