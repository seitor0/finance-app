"use client";

import { useApp } from "@/context/AppContext";
import { CheckCircle, Clock, PauseCircle } from "lucide-react";

export default function CosasPorPagarPage() {
  const { cosasPorPagar, cambiarEstadoPago } = useApp();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Cosas por pagar</h1>

      <div className="grid gap-4">
        {cosasPorPagar.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{item.nombre}</div>
              <div className="text-sm text-gray-400">
                ${item.monto} — vence {item.vencimiento}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => cambiarEstadoPago(item.id, "pagado")}
                className="p-2 rounded bg-green-600 text-white"
              >
                <CheckCircle size={18} />
              </button>

              <button
                onClick={() => cambiarEstadoPago(item.id, "falta")}
                className="p-2 rounded bg-yellow-600 text-white"
              >
                <Clock size={18} />
              </button>

              <button
                onClick={() => cambiarEstadoPago(item.id, "pospuesto")}
                className="p-2 rounded bg-gray-500 text-white"
              >
                <PauseCircle size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
