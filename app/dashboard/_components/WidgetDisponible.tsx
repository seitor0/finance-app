"use client";

import { useApp } from "@/context/AppContext";

export default function WidgetDisponible() {
  const { dineroDisponible } = useApp();

  const color =
    dineroDisponible >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="bg-white p-6 rounded-xl shadow w-full flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-2">Disponible</h2>

      <div className={`text-4xl font-bold ${color}`}>
        ${Number(dineroDisponible).toLocaleString("es-AR")}
      </div>
    </div>
  );
}
