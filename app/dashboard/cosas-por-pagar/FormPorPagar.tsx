"use client";

import { useState, useEffect } from "react";
import { PaymentStatus } from "@/context/AppContext";

const CATEGORIAS = [
  "Servicios",
  "Suscripciones",
  "Impuestos",
  "Alquiler",
  "Cochera",
  "Tarjeta",
  "Salud",
  "Supermercado",
  "Otros",
];

export default function FormPorPagar({
  editItem,
  onClose,
  onSave,
}: {
  editItem: any;
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [monto, setMonto] = useState<number | "">("");
  const [vencimiento, setVencimiento] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("falta");

  // Cargar datos en modo edición
  useEffect(() => {
  if (!editItem) {
    setNombre("");
    setCategoria("");
    setMonto("");
    setVencimiento("");
    setStatus("falta");
  }
}, [editItem]);


  function submit(e: any) {
    e.preventDefault();

    if (!nombre || !monto) return;

    onSave({
      nombre,
      categoria,
      monto: Number(monto),
      vencimiento,
      status,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {editItem ? "Editar pago pendiente" : "Nuevo pago pendiente"}
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Seleccionar</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Monto</label>
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value as any)}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Vencimiento</label>
            <input
              type="date"
              value={vencimiento}
              onChange={(e) => setVencimiento(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PaymentStatus)}
              className="w-full p-2 border rounded"
            >
              <option value="falta">Falta pagar</option>
              <option value="pagado">Pagado</option>
              <option value="pospuesto">Pospuesto</option>
            </select>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
