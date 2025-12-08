"use client";

import { type FormEvent, useMemo, useState, useEffect } from "react";
import { PaymentStatus, type ToPayItem } from "@/context/AppContext";
import { useApp } from "@/context/AppContext";

const DEFAULT_PAGAR_CATEGORIAS = [
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

interface FormPorPagarProps {
  editItem?: ToPayItem | null;
  onClose: () => void;
  onSave: (data: Omit<ToPayItem, "id">) => void;
}

export default function FormPorPagar({ editItem, onClose, onSave }: FormPorPagarProps) {
  const { categorias } = useApp();
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [monto, setMonto] = useState<string>("");
  const [vencimiento, setVencimiento] = useState("");
  const [status, setStatus] = useState<PaymentStatus>("falta");

  const categoriasDisponibles = useMemo(() => {
    const list = categorias.filter((c) => c.tipo === "Gasto").map((c) => c.nombre);
    return list.length > 0 ? list : DEFAULT_PAGAR_CATEGORIAS;
  }, [categorias]);

  // Cargar datos en modo edición
  useEffect(() => {
    const timer = setTimeout(() => {
      if (editItem) {
        setNombre(editItem.nombre || "");
        setCategoria(editItem.categoria || "");
        setMonto(editItem.monto ? String(editItem.monto) : "");
        setVencimiento(editItem.vencimiento || "");
        setStatus(editItem.status || "falta");
        return;
      }

      setNombre("");
      setCategoria(categoriasDisponibles[0] || "");
      setMonto("");
      setVencimiento("");
      setStatus("falta");
    }, 0);

    return () => clearTimeout(timer);
  }, [editItem, categoriasDisponibles]);


  function submit(e: FormEvent<HTMLFormElement>) {
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
              {categoriasDisponibles.map((c) => (
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
              onChange={(e) => setMonto(e.target.value)}
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
