"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import FormularioCliente from "./FormularioCliente"; 
import "@/styles/clientes.css";

export default function ClientesPage() {
  const { clientes, agregarCliente, editarCliente, borrarCliente } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const handleSave = async (data) => {
    if (editItem) {
      await editarCliente(editItem.id, data);
    } else {
      await agregarCliente(data);
    }
    setShowForm(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6">Clientes</h1>

      <button
        onClick={() => {
          setEditItem(null);
          setShowForm(true);
        }}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        + Agregar cliente
      </button>

      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="border-b">
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Teléfono</th>
            <th className="p-3 text-left">Notas</th>
            <th className="p-3"></th>
          </tr>
        </thead>

        <tbody>
          {clientes.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-3">{c.nombre}</td>
              <td className="p-3">{c.email}</td>
              <td className="p-3">{c.telefono}</td>
              <td className="p-3">{c.notas}</td>

              <td className="p-3 flex gap-2">
                <button
                  className="text-blue-600"
                  onClick={() => {
                    setEditItem(c);
                    setShowForm(true);
                  }}
                >
                  Editar
                </button>

                <button
                  className="text-red-600"
                  onClick={() => borrarCliente(c.id)}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <FormularioCliente
          editItem={editItem}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
