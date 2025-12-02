"use client";

import { useEffect, useState } from "react";

const CATEGORIAS = [
  "Comida",
  "Supermercado",
  "Transporte",
  "Auto / Cochera / Nafta",
  "Servicios",
  "Hogar",
  "Salud",
  "Educación",
  "Impuestos / AFIP",
  "Ocio",
  "Mascotas",
  "Compras",
  "Otros",
];

export default function FormularioGasto({ onClose, onSave, editItem }) {
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");
  const [categoria, setCategoria] = useState("");

  // ==========================
  // Cargar datos al editar
  // ==========================
  useEffect(() => {
    if (editItem) {
      setDescripcion(editItem.descripcion);
      setMonto(editItem.monto);
      setFecha(editItem.fecha);
      setCategoria(editItem.categoria || "");
    }
  }, [editItem]);

  // ==========================
  // Normalizador de texto
  // ==========================
  function normalizarTexto(str) {
    return (str || "")
      .toLowerCase()
      .replace(/hoy|ayer|gaste|gasté|compré|pagué|saqué|me salió/gi, "")
      .trim();
  }

  // ==========================
  // IA: Categorizar automáticamente
  // ==========================
  async function categorizarAutomaticamente(texto) {
    if (!texto || texto.length < 3) return;

    const limpio = normalizarTexto(texto);

    const prompt = `
Sos un asistente experto en finanzas personales de Argentina.
Tu tarea es analizar un gasto y responder SOLO con la categoría correcta.

Categorías permitidas:
${CATEGORIAS.join(", ")}

Reglas:
- Respondé SOLO con la categoría exacta.
- No agregues explicaciones.
- Si no estás seguro, devolvé "Otros".

Texto: "${limpio}"
`;

    try {
      const resp = await fetch("/api/ia-categorizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const json = await resp.json();
      if (json.categoria) {
        setCategoria(json.categoria);
      }
    } catch (e) {
      console.error("Error IA:", e);
    }
  }

  // Detectar categoría cuando el usuario escribe
  useEffect(() => {
    if (!editItem) categorizarAutomaticamente(descripcion);
  }, [descripcion]);

  // ==========================
  // Submit
  // ==========================
  const submit = (e) => {
    e.preventDefault();

    onSave({
      descripcion,
      monto,
      fecha,
      categoria: categoria || "Otros",
    });
  };

  return (
    <div className="modal">
      <form onSubmit={submit} className="bg-white p-5 rounded shadow-md">

        <h2 className="text-2xl font-semibold mb-4">
          {editItem ? "Editar gasto" : "Nuevo gasto"}
        </h2>

        {/* Descripción */}
        <label>Descripción</label>
        <input
          className="input"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        />

        {/* Monto */}
        <label>Monto</label>
        <input
          className="input"
          type="number"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          required
        />

        {/* Fecha */}
        <label>Fecha</label>
        <input
          className="input"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />

        {/* Categoría */}
        <label>Categoría</label>
        <select
          className="input"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          {CATEGORIAS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <div className="flex gap-3 mt-5">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            Guardar
          </button>

          <button
            type="button"
            className="bg-gray-300 px-4 py-2 rounded"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
