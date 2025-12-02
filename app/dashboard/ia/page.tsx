"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

export default function IAInputPage() {
  const { agregarIngreso, agregarGasto } = useApp();
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState("");

  const procesar = async () => {
    if (!texto.trim()) return;

    setLoading(true);
    setRespuesta("");

    try {
      const r = await fetch("/api/ai-input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });

      const data = await r.json();

      setRespuesta(JSON.stringify(data, null, 2));

      if (data.tipo === "ingreso") {
        agregarIngreso({
        descripcion: data.descripcion,
  monto: data.monto,
  categoria: data.categoria,
  fecha: data.fecha,
        });
      } else if (data.tipo === "gasto") {
        agregarGasto({
          descripcion: data.descripcion,
          monto: data.monto,
          categoria: data.categoria,
          fecha: data.fecha,
        });
      }
    } catch (e) {
      setRespuesta("Error al procesar");
    }

    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-4">Ingresar con IA</h1>

      <textarea
        className="border w-full p-3 rounded mb-4"
        rows={4}
        placeholder='Ejemplo: "Gasté 3000 en el super hoy"'
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />

      <button
        onClick={procesar}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Procesando..." : "Enviar a IA"}
      </button>

      {respuesta && (
        <pre className="mt-4 p-4 bg-gray-100 rounded text-sm">
          {respuesta}
        </pre>
      )}
    </div>
  );
}
