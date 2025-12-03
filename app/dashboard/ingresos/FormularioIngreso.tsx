"use client";

import { useState, useEffect } from "react";

export default function FormularioIngreso({ onClose, editItem, onSave }) {
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");

  useEffect(() => {
    if (editItem) {
      setDescripcion(editItem.descripcion);
      setMonto(editItem.monto);
      setFecha(editItem.fecha);
    }
  }, [editItem]);

  const submit = (e) => {
    e.preventDefault();

    const data = {
      descripcion,
      monto: Number(monto),    // ← CORRECCIÓN CLAVE
      fecha,
      categoria: editItem?.categoria || "General", // opcional
    };

    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-semibold mb-4">
          {editItem ? "Editar ingreso" : "Nuevo ingreso"}
        </h2>

        <form onSubmit={submit}>
          <label className="block mb-3">
            Descripción
            <input
              className="border p-2 w-full"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
            />
          </label>

          <label className="block mb-3">
            Monto
            <input
              type="number"
              className="border p-2 w-full"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              required
            />
          </label>

          <label className="block mb-3">
            Fecha
            <input
              type="date"
              className="border p-2 w-full"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
            />
          </label>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-3 py-1 bg-gray-400 text-white rounded"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 text-white rounded"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
