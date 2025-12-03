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
    <div className="space-y-6 fade-up">
      <h1 className="text-3xl font-semibold mb-2">Cosas por cobrar</h1>
      <p className="text-slate-500 text-sm -mt-2 mb-4">
        Cobros pendientes, facturados y por cobrar.
      </p>

      {/* ===================== BOTÓN NUEVO ===================== */}
      <button
        onClick={() => {
          setEditItem(null);
          setShowForm(true);
        }}
        className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700"
      >
        + Nuevo cobro
      </button>

      {/* ===================== LISTADO ===================== */}
      <div className="space-y-3">
        {cosasPorCobrar.length === 0 && (
          <p className="text-slate-500 text-sm">
            No tenés cobros pendientes. 💸
          </p>
        )}

        {cosasPorCobrar.map((item) => (
          <div
            key={item.id}
            className="glass-card flex items-center justify-between"
          >
            {/* IZQUIERDA */}
            <div>
              <p className="font-semibold">{item.nombre}</p>

              <p className="text-sm text-slate-500">
                ${Number(item.monto).toLocaleString("es-AR")}
                {item.vencimiento && <> · vence {item.vencimiento}</>}
              </p>

              {item.categoria && (
                <p className="text-[11px] text-slate-400 mt-1">
                  {item.categoria}
                </p>
              )}
            </div>

            {/* DERECHA */}
            <div className="flex items-center gap-3">
              {/* CAMBIAR ESTADO */}
              <select
                value={item.status}
                onChange={(e) => handleChangeStatus(item, e.target.value)}
                className="border rounded-lg px-2 py-1 text-sm"
                disabled={item.status === "cobrado"}
              >
                {ESTADOS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* EDITAR */}
              <button
                onClick={() => {
                  if (item.status === "cobrado") return alert("Este cobro ya fue acreditado y no puede editarse.");
                  setEditItem(item);
                  setShowForm(true);
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                Editar
              </button>

              {/* BORRAR */}
              <button
                onClick={() => borrarCosaPorCobrar(item.id)}
                className="text-xs text-rose-600 hover:underline"
              >
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===================== FORMULARIO ===================== */}
      {showForm && (
        <FormPorCobrar
          editItem={editItem}
          onClose={() => {
            setShowForm(false);
            setEditItem(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
