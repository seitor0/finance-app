"use client";

import { useState } from "react";
import { ToCollectItem } from "@/context/AppContext";

interface FormPorCobrarProps {
  onClose: () => void;
  editItem?: ToCollectItem | null;
  onSave: (data: Omit<ToCollectItem, "id">) => void;
}

export default function FormPorCobrar({
  onClose,
  editItem,
  onSave
}: FormPorCobrarProps) {

  const [nombre, setNombre] = useState(editItem?.nombre ?? "");
  const [categoria, setCategoria] = useState(editItem?.categoria ?? "");
  const [monto, setMonto] = useState(editItem?.monto?.toString() ?? "");
  const [vencimiento, setVencimiento] = useState(editItem?.vencimiento ?? "");
  const [status, setStatus] = useState(editItem?.status ?? "terminado");
  const [importante, setImportante] = useState(editItem?.importante ?? false);

  const guardar = () => {
    if (!nombre.trim() || !monto) return;

    onSave({
      nombre: nombre.trim(),
      categoria: categoria.trim(),
      monto: Number(monto),
      vencimiento: vencimiento || "",
      status,
      importante,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">

        <h2 className="text-xl font-semibold mb-2">
          {editItem ? "Editar cobro" : "Nuevo cobro pendiente"}
        </h2>

        {/* NOMBRE */}
        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input
            className="w-full mt-1 p-2 border rounded-lg"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>

        {/* CATEGORIA */}
        <div>
          <label className="block text-sm font-medium">Categoría</label>
          <input
            className="w-full mt-1 p-2 border rounded-lg"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
        </div>

        {/* MONTO */}
        <div>
          <label className="block text-sm font-medium">Monto</label>
          <input
            type="number"
            className="w-full mt-1 p-2 border rounded-lg"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
        </div>

        {/* VENCIMIENTO */}
        <div>
          <label className="block text-sm font-medium">Vencimiento</label>
          <input
            type="date"
            className="w-full mt-1 p-2 border rounded-lg"
            value={vencimiento || ""}
            onChange={(e) => setVencimiento(e.target.value)}
          />
        </div>

        {/* ESTADO */}
        <div>
          <label className="block text-sm font-medium">Estado</label>
          <select
            className="w-full mt-1 p-2 border rounded-lg"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            disabled={editItem?.status === "cobrado"}
          >
            <option value="terminado">Terminado</option>
            <option value="facturado">Facturado</option>
            <option value="cobrado">Cobrado</option>
          </select>
        </div>

        {/* IMPORTANTE */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={importante}
            onChange={() => setImportante(!importante)}
          />
          <label className="text-sm">Marcar como importante</label>
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </button>

          <button
            onClick={guardar}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>

      </div>
    </div>
  );
}
