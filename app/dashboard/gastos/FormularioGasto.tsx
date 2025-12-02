"use client";

import { useState, useEffect } from "react";

export default function Formulariogasto({ onClose, onSave, editItem }) {
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
      id: editItem?.id || Date.now(),
      descripcion,
      monto: Number(monto),
      fecha,
    };

    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <form onSubmit={submit} className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-xl font-bold mb-4">
          {editItem ? "Editar gasto" : "Nuevo gasto"}
        </h2>

        <label className="block mb-2">
          Descripción
          <input
            className="border p-2 w-full"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </label>

        <label className="block mb-2">
          Monto
          <input
            className="border p-2 w-full"
            type="number"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
        </label>

        <label className="block mb-4">
          Fecha
          <input
            className="border p-2 w-full"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-gray-300 rounded"
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
  );
}
