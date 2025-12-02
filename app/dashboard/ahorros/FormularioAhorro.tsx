"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";

export default function FormularioAhorro({ onClose, editItem }) {
  const { agregarAhorro, editarAhorro } = useApp();

  const [usd, setUsd] = useState("");
  const [fecha, setFecha] = useState("");
  const [notas, setNotas] = useState("");

  useEffect(() => {
    if (editItem) {
      setUsd(editItem.usd);
      setFecha(editItem.fecha);
      setNotas(editItem.notas || "");
    } else {
      setFecha(new Date().toISOString().split("T")[0]);
    }
  }, [editItem]);

  const guardar = async (e) => {
    e.preventDefault();

    const data = {
      usd: Number(usd),
      fecha,
      notas,
    };

    if (editItem) {
      await editarAhorro(editItem.id, data);
    } else {
      await agregarAhorro(data);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <form
        onSubmit={guardar}
        className="bg-white p-6 rounded-2xl w-96 shadow-xl"
      >
        <h2 className="text-xl font-semibold mb-4">
          {editItem ? "Editar ahorro" : "Nuevo ahorro"}
        </h2>

        <label className="block mb-2 text-sm">
          Monto en USD
          <input
            type="number"
            value={usd}
            onChange={(e) => setUsd(e.target.value)}
            className="border p-2 rounded w-full"
            required
          />
        </label>

        <label className="block mb-2 text-sm">
          Fecha
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </label>

        <label className="block mb-4 text-sm">
          Notas (opcional)
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="border p-2 rounded w-full"
            rows={2}
          />
        </label>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            Cancelar
          </button>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded"
            type="submit"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
