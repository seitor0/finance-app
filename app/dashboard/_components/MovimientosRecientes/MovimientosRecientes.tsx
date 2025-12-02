"use client";

import { useState, useMemo } from "react";
import type { Movimiento } from "./types";

import TablaMovimientos from "./TablaMovimientos";
import FiltrosMovimientos, {
  FiltroMovimientos,
} from "./FiltrosMovimientos";

export default function MovimientosRecientes({
  titulo,
  movimientos,
}: {
  titulo: string;
  movimientos: Movimiento[];
}) {
  const [filtros, setFiltros] = useState<FiltroMovimientos>({
    texto: "",
    tipo: "Todos",
    rango: "mes",
    orden: "recientes",
  });

  const movFiltrados = useMemo(() => {
    let lista = [...movimientos];

    // FILTRO: TEXTO
    if (filtros.texto.trim() !== "") {
      lista = lista.filter((m) =>
        m.descripcion.toLowerCase().includes(filtros.texto.toLowerCase())
      );
    }

    // FILTRO: TIPO
    if (filtros.tipo !== "Todos") {
      lista = lista.filter((m) => m.tipo === filtros.tipo);
    }

    // FILTRO: RANGO
    const hoy = new Date();
    if (filtros.rango === "mes") {
      lista = lista.filter((m) => {
        const f = new Date(m.fecha);
        return (
          f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear()
        );
      });
    }
    if (filtros.rango === "30") {
      lista = lista.filter((m) => {
        const f = new Date(m.fecha);
        return hoy.getTime() - f.getTime() <= 30 * 24 * 60 * 60 * 1000;
      });
    }

    // ORDEN
    if (filtros.orden === "recientes") {
      lista.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }
    if (filtros.orden === "antiguos") {
      lista.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    }
    if (filtros.orden === "montoMayor") {
      lista.sort((a, b) => b.monto - a.monto);
    }
    if (filtros.orden === "montoMenor") {
      lista.sort((a, b) => a.monto - b.monto);
    }

    return lista;
  }, [movimientos, filtros]);

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">{titulo}</h2>

      <FiltrosMovimientos onChange={setFiltros} />

      <TablaMovimientos movimientos={movFiltrados} />
    </div>
  );
}
