"use client";

import { useApp } from "@/context/AppContext";
import { useState } from "react";
import FormularioGasto from "./FormularioGasto";
import "@/styles/gastos.css";

export default function GastosPage() {
  const { gastos, agregarGasto, editarGasto, borrarGasto } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Gastos</h1>

      <button
        onClick={() => {
          setEditItem(null);
          setShowForm(true);
        }}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        + Agregar gasto
      </button>

      {/* ======= TABLA ======= */}
      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="p-3 text-left">Fecha</th>
            <th className="p-3 text-left">Categoría</th>
            <th className="p-3 text-left">Descripción</th>
            <th className="p-3 text-left">Monto</th>
            <th className="p-3 text-left"></th>
          </tr>
        </thead>

        <tbody>
          {gastos.map((g) => (
            <tr key={g.id} className="border-b">
              
              {/* FECHA */}
              <td className="p-3">{g.fecha}</td>

              {/* CATEGORÍA */}
              <td className="p-3 font-medium text-gray-700">
                {g.categoria || "—"}
              </td>

              {/* DESCRIPCIÓN */}
              <td className="p-3">{g.descripcion}</td>

              {/* MONTO */}
              <td className="p-3">
                {g.monto
                  ? `$${Number(g.monto).toLocaleString("es-AR")}`
                  : "$0"}
              </td>

              {/* ACCIONES */}
              <td className="p-3 flex gap-3">
                <button
                  className="text-blue-600"
                  onClick={() => {
                    setEditItem(g);
                    setShowForm(true);
                  }}
                >
                  Editar
                </button>

                <button
                  className="text-red-600"
                  onClick={() => borrarGasto(g.id)}
                >
                  Borrar
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>

      {/* ======= MODAL FORM ======= */}
      {showForm && (
        <FormularioGasto
          editItem={editItem}
          onClose={() => setShowForm(false)}
          onSave={(data) => {
            if (editItem) {
              editarGasto(editItem.id, data);
            } else {
              agregarGasto(data);
            }
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
