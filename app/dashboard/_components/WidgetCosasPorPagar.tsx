"use client";

import { useApp } from "@/context/AppContext";

export default function WidgetCosasPorPagar() {
  const { cosasPorPagar } = useApp();

  const pendientes = cosasPorPagar.filter((c) => c.status !== "pagado");

  return (
    <div className="p-6 rounded-xl bg-white/10 backdrop-blur shadow">
      <h2 className="text-xl font-semibold mb-2">Cosas por pagar</h2>

      {pendientes.length === 0 && (
        <p className="text-gray-400 text-sm">No tenés nada pendiente 🎉</p>
      )}

      <ul className="text-sm space-y-1">
        {pendientes.slice(0, 3).map((c) => (
          <li key={c.id} className="flex justify-between">
            <span>{c.nombre}</span>
            <span className="text-gray-400">${c.monto}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
