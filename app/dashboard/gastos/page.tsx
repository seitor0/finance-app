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

      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="border-b">
            <th className="p-3 text-left">Fecha</th>
            <th className="p-3 text-left">Descripción</th>
            <th className="p-3 text-left">Monto</th>
            <th className="p-3"></th>
          </tr>
        </thead>

        <tbody>
          {gastos.map((g) => (
            <tr key={g.id} className="border-b">
              <td className="p-3">{g.fecha}</td>
              <td className="p-3">{g.descripcion}</td>
              <td className="p-3">${g.monto}</td>

              <td className="p-3 flex gap-2">
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

      {showForm && (
        <FormularioGasto
          editItem={editItem}
          onClose={() => setShowForm(false)}
          onSave={(data) => {
            if (editItem) editarGasto(data);
            else agregarGasto(data);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
