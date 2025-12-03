"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import FormPorPagar from "./FormPorPagar";

export default function CosasPorPagarPage() {
  const {
  cosasPorPagar,
  agregarCosaPorPagar,
  cambiarEstadoPago,
  editarCosaPorPagar, // 👈 nuevo
} = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Cosas por pagar</h1>

      {/* BOTÓN NUEVO */}
      <button
        onClick={() => {
          setEditItem(null);
          setShowForm(true);
        }}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        + Agregar pago pendiente
      </button>

      {/* TABLA */}
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="border-b">
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-left">Categoría</th>
            <th className="p-3 text-left">Monto</th>
            <th className="p-3 text-left">Vencimiento</th>
            <th className="p-3 text-left">Estado</th>
            <th className="p-3 text-left">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {cosasPorPagar.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-3">{item.nombre}</td>
              <td className="p-3">{item.categoria || "-"}</td>
              <td className="p-3">${item.monto.toLocaleString("es-AR")}</td>
              <td className="p-3">{item.vencimiento || "-"}</td>
              <td className="p-3 capitalize">{item.status}</td>

              <td className="p-3 flex gap-3">
                {/* MARCAR PAGADO */}
                {item.status !== "pagado" && (
                  <button
                    className="text-green-600"
                    onClick={() => cambiarEstadoPago(item.id, "pagado")}
                  >
                    Marcar pagado
                  </button>
                )}

                {/* EDITAR */}
                <button
                  className="text-blue-600"
                  onClick={() => {
                    setEditItem(item);
                    setShowForm(true);
                  }}
                >
                  Editar
                </button>

                {/* POSPONER */}
                {item.status !== "pospuesto" && (
                  <button
                    className="text-orange-600"
                    onClick={() => cambiarEstadoPago(item.id, "pospuesto")}
                  >
                    Posponer
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* FORMULARIO */}
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
