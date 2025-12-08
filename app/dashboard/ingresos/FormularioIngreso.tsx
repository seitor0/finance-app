"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

import { useApp, type Movimiento } from "@/context/AppContext";

const DEFAULT_INGRESO_CATEGORIA = "General";

interface FormularioIngresoProps {
  onClose: () => void;
  editItem?: Movimiento | null;
  onSave: (data: Omit<Movimiento, "id">) => void;
}

export default function FormularioIngreso({ onClose, editItem, onSave }: FormularioIngresoProps) {
  const { categorias } = useApp();
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");
  const [categoria, setCategoria] = useState(DEFAULT_INGRESO_CATEGORIA);

  const categoriasIngreso = useMemo(
    () => categorias.filter((c) => c.tipo === "Ingreso"),
    [categorias]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (editItem) {
        setDescripcion(editItem.descripcion);
        setMonto(String(editItem.monto ?? ""));
        setFecha(editItem.fecha);
        setCategoria(editItem.categoria || DEFAULT_INGRESO_CATEGORIA);
      } else {
        setDescripcion("");
        setMonto("");
        setFecha(new Date().toISOString().slice(0, 10));
        setCategoria(categoriasIngreso[0]?.nombre || DEFAULT_INGRESO_CATEGORIA);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [editItem, categoriasIngreso]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = {
      descripcion,
      monto: Number(monto),    // ← CORRECCIÓN CLAVE
      fecha,
      categoria: categoria || DEFAULT_INGRESO_CATEGORIA,
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

          <label className="block mb-3">
            Categoría
            <select
              className="border p-2 w-full mt-1"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            >
              <option value={DEFAULT_INGRESO_CATEGORIA}>{DEFAULT_INGRESO_CATEGORIA}</option>
              {categoriasIngreso.map((c) => (
                <option key={c.id} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </select>
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
