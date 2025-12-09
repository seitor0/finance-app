"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import FormularioCliente from "./FormularioCliente"; 
import "./styles.css";
import { TableFilters } from "@/components/TableFilters";




export default function ClientesPage() {
  const { clientes, agregarCliente, editarCliente, borrarCliente } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filters, setFilters] = useState({
    nombre: "",
    email: "",
    telefono: "",
    notas: "",
  });

  const filteredClientes = useMemo(() => {
    return clientes.filter((c) => {
      const nombreMatch = filters.nombre
        ? c.nombre.toLowerCase().includes(filters.nombre.toLowerCase())
        : true;
      const emailMatch = filters.email
        ? c.email.toLowerCase().includes(filters.email.toLowerCase())
        : true;
      const telefonoMatch = filters.telefono
        ? c.telefono.toLowerCase().includes(filters.telefono.toLowerCase())
        : true;
      const notasMatch = filters.notas
        ? (c.notas || "").toLowerCase().includes(filters.notas.toLowerCase())
        : true;

      return nombreMatch && emailMatch && telefonoMatch && notasMatch;
    });
  }, [clientes, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      nombre: "",
      email: "",
      telefono: "",
      notas: "",
    });
  };

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

      <TableFilters
        fields={[
          { key: "nombre", label: "Nombre", type: "search", placeholder: "Buscar por nombre" },
          { key: "email", label: "Email", type: "search", placeholder: "correo@ejemplo" },
          { key: "telefono", label: "Teléfono", type: "search", placeholder: "+54..." },
          { key: "notas", label: "Notas", type: "search", placeholder: "Palabras clave" },
        ]}
        values={filters}
        onChange={handleFilterChange}
        onClear={resetFilters}
      />

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
          {filteredClientes.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-slate-500">
                No se encontraron clientes para los filtros actuales.
              </td>
            </tr>
          )}
          {filteredClientes.map((c) => (
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
