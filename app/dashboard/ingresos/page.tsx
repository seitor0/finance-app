"use client";

import { useApp } from "@/context/AppContext";
import { useState } from "react";
import FormularioIngreso from "./FormularioIngreso";

export default function IngresosPage() {
  const { ingresos, agregarIngreso, editarIngreso, borrarIngreso } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const handleSave = (data) => {
    const payload = {
      descripcion: data.descripcion,
      monto: Number(data.monto),   // ← aseguramos número siempre
      fecha: data.fecha,
      categoria: data.categoria || "General",
    };

    if (editItem) {
      editarIngreso(editItem.id, payload);
    } else {
      agregarIngreso(payload);
    }

    setShowForm(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Ingresos</h1>

      <button
        onClick={() => {
          setEditItem(null);
          setShowForm(true);
        }}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        + Agregar ingreso
      </button>

      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="border-b">
            <th className="p-3 text-left">Fecha</th>
            <th className="p-3 text-left">Descripción</th>
            <th className="p-3 text-left">Monto</th>
            <th className="p-3 text-left">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {ingresos.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-gray-500">
                No hay ingresos cargados.
              </td>
            </tr>
          )}

          {ingresos.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="p-3">{item.fecha}</td>
              <td className="p-3">{item.descripcion}</td>
              <td className="p-3">${item.monto.toLocaleString("es-AR")}</td>
              <td className="p-3 flex gap-2">
                <button
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                  onClick={() => {
                    setEditItem(item);
                    setShowForm(true);
                  }}
                >
                  Editar
                </button>

                <button
                  className="px-3 py-1 bg-red-600 text-white rounded"
                  onClick={() => borrarIngreso(item.id)}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
