"use client";

import { useState } from "react";

export type FiltroMovimientos = {
  texto: string;
  tipo: "Todos" | "Ingreso" | "Gasto";
  rango: "mes" | "30" | "todo";
  orden: "recientes" | "antiguos" | "montoMayor" | "montoMenor";
};

export default function FiltrosMovimientos({
  onChange,
}: {
  onChange: (filtros: FiltroMovimientos) => void;
}) {
  const [filtros, setFiltros] = useState<FiltroMovimientos>({
    texto: "",
    tipo: "Todos",
    rango: "mes",
    orden: "recientes",
  });

  const update = <K extends keyof FiltroMovimientos>(
    campo: K,
    valor: FiltroMovimientos[K]
  ) => {
    const nuevo = { ...filtros, [campo]: valor };
    setFiltros(nuevo);
    onChange(nuevo);
  };

  return (
    <div className="flex flex-wrap gap-4 items-end mb-6 bg-white p-4 rounded shadow">
      {/* TEXTO */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-600">Buscar</label>
        <input
          type="text"
          value={filtros.texto}
          onChange={(e) => update("texto", e.target.value)}
          className="border px-3 py-2 rounded"
          placeholder="Descripción..."
        />
      </div>

      {/* TIPO */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-600">Tipo</label>
        <select
          value={filtros.tipo}
          onChange={(e) => update("tipo", e.target.value as FiltroMovimientos["tipo"])}
          className="border px-3 py-2 rounded"
        >
          <option value="Todos">Todos</option>
          <option value="Ingreso">Ingresos</option>
          <option value="Gasto">Gastos</option>
        </select>
      </div>

      {/* RANGO */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-600">Rango</label>
        <select
          value={filtros.rango}
          onChange={(e) => update("rango", e.target.value as FiltroMovimientos["rango"])}
          className="border px-3 py-2 rounded"
        >
          <option value="mes">Este mes</option>
          <option value="30">Últimos 30 días</option>
          <option value="todo">Todo</option>
        </select>
      </div>

      {/* ORDEN */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-600">Orden</label>
        <select
          value={filtros.orden}
          onChange={(e) => update("orden", e.target.value as FiltroMovimientos["orden"])}
          className="border px-3 py-2 rounded"
        >
          <option value="recientes">Más recientes</option>
          <option value="antiguos">Más antiguos</option>
          <option value="montoMayor">Monto mayor</option>
          <option value="montoMenor">Monto menor</option>
        </select>
      </div>
    </div>
  );
}
