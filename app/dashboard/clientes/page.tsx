"use client";

import { useApp } from "@/context/AppContext";
import { useState } from "react";
import "./styles.css";                 // ✔️ IMPORT CORREGIDO
import FormularioCliente from "./FormularioCliente";

export default function ClientesPage() {
  const { clientes, agregarCliente, editarCliente, borrarCliente } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

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
            <th className="p-3 text-left">CUIT</th>
            <th className="p-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="p-3">{c.nombre}</td>
              <td className="p-3">{c.email}</td>
              <td className="p-3">{c.telefono}</td>
              <td className="p-3">{c.cuit}</td>
              <td className="p-3 flex gap-2">
                <button
                  onClick={() => {
                    setEditItem(c);
                    setShowForm(true);
                  }}
                  className="text-blue-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => borrarCliente(c.id)}
                  className="text-red-600"
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
          onClose={() => setShowForm(false)}
          editItem={editItem}
          onSave={(data) => {
            editItem ? editarCliente(data) : agregarCliente(data);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}
