"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import FormPorCobrar from "./FormPorCobrar";

import type { ToCollectItem, CobroStatus } from "@/context/AppContext";


const ESTADOS = [
  { value: "terminado", label: "Terminado" },
  { value: "facturado", label: "Facturado" },
  { value: "cobrado", label: "Cobrado" },
] as const;

export default function CosasPorCobrarPage() {
  const {
    cosasPorCobrar,
    agregarCosaPorCobrar,
    editarCosaPorCobrar,
    borrarCosaPorCobrar,
    marcarCobroComoCobrado,
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<ToCollectItem | null>(null);

  // ---------------------------
  // ALTA / EDICIÓN
  // ---------------------------
  const handleSave = async (data: Omit<ToCollectItem, "id">) => {
    const esEdicion = Boolean(editItem);

    // 👉 Caso especial: si desde el form el usuario elige "cobrado"
    if (data.status === "cobrado") {
      if (esEdicion) {
        await marcarCobroComoCobrado(editItem!);
      } else {
        // si es un nuevo cobro creado como cobrado, lo tratamos igual
        await marcarCobroComoCobrado({
          id: "temp", // no importa, solo para pasar valores
          nombre: data.nombre,
          categoria: data.categoria,
          monto: data.monto,
          vencimiento: data.vencimiento ?? "",
          status: "cobrado",
          importante: data.importante,
        } as ToCollectItem);
      }
    } else {
      // Normal (terminado/facturado)
      if (esEdicion) {
        await editarCosaPorCobrar(editItem!.id, data);
      } else {
        await agregarCosaPorCobrar(data);
      }
    }

    setShowForm(false);
    setEditItem(null);
  };

  // ---------------------------
  // CAMBIAR ESTADO DESDE EL SELECT
  // ---------------------------
async function handleChangeStatus(item: ToCollectItem, nuevoEstado: string) {
  if (nuevoEstado === "cobrado") {
    await marcarCobroComoCobrado(item);
  } else {
    await editarCosaPorCobrar(item.id, { status: nuevoEstado as CobroStatus });
  }
}

  return (
    <div className="space-y-6 font-[Inter] text-slate-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Cosas por cobrar</h1>
          <p className="text-sm text-slate-500">Gestioná facturas, cobranzas y su estado.</p>
        </div>

        <button
          onClick={() => {
            setEditItem(null);
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Nuevo cobro
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
            {cosasPorCobrar.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No tenés cobros pendientes.
                </td>
              </tr>
            )}

            {cosasPorCobrar.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/70">
                <td className="px-4 py-3 font-medium text-slate-700">{item.nombre}</td>
                <td className="px-4 py-3">{item.categoria || "—"}</td>
                <td className="px-4 py-3 font-semibold text-emerald-600">
                  ${Number(item.monto).toLocaleString("es-AR")}
                </td>
                <td className="px-4 py-3">{item.vencimiento || "—"}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold capitalize">
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={item.status}
                      onChange={(e) => handleChangeStatus(item, e.target.value)}
                      disabled={item.status === "cobrado"}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 disabled:bg-slate-100"
                    >
                      {ESTADOS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => {
                        if (item.status === "cobrado") {
                          alert("Este cobro ya fue acreditado y no puede editarse.");
                          return;
                        }
                        setEditItem(item);
                        setShowForm(true);
                      }}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => borrarCosaPorCobrar(item.id)}
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
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <FormPorCobrar
            editItem={editItem}
            onClose={() => {
              setShowForm(false);
              setEditItem(null);
            }}
            onSave={handleSave}
          />
        </div>
      )}
    </div>
  );
}
