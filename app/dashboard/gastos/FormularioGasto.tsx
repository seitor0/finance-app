"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

import { useApp, type Movimiento } from "@/context/AppContext";

const DEFAULT_GASTO_CATEGORIES = [
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

interface FormularioGastoProps {
  onClose: () => void;
  onSave: (data: Omit<Movimiento, "id">) => void;
  editItem?: Movimiento | null;
}

export default function FormularioGasto({ onClose, onSave, editItem }: FormularioGastoProps) {
  const { categorias } = useApp();
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");
  const [categoria, setCategoria] = useState("");

  const categoriasGasto = useMemo(
    () => categorias.filter((c) => c.tipo === "Gasto"),
    [categorias]
  );

  const categoriasDisponibles = useMemo(() => {
    const nombres = categoriasGasto.map((c) => c.nombre);
    return nombres.length > 0 ? nombres : DEFAULT_GASTO_CATEGORIES;
  }, [categoriasGasto]);

  // ==========================
  // Cargar datos al editar
  // ==========================
  useEffect(() => {
    const timer = setTimeout(() => {
      if (editItem) {
        setDescripcion(editItem.descripcion);
        setMonto(String(editItem.monto ?? ""));
        setFecha(editItem.fecha);
        setCategoria(editItem.categoria || "");
      } else if (!categoria) {
        setDescripcion("");
        setMonto("");
        setFecha(new Date().toISOString().slice(0, 10));
        setCategoria(categoriasDisponibles[0] || "");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [editItem, categoria, categoriasDisponibles]);

  // ==========================
  // Normalizador de texto
  // ==========================
  function normalizarTexto(str: string) {
    return (str || "")
      .toLowerCase()
      .replace(/hoy|ayer|gaste|gasté|compré|pagué|saqué|me salió/gi, "")
      .trim();
  }

  // ==========================
  // IA: Categorizar automáticamente
  // ==========================
  const categorizarAutomaticamente = useCallback(
    async (texto: string) => {
      if (!texto || texto.length < 3) return;

      const limpio = normalizarTexto(texto);

    const prompt = `
Sos un asistente experto en finanzas personales de Argentina.
Tu tarea es analizar un gasto y responder SOLO con la categoría correcta.

Categorías permitidas:
${categoriasDisponibles.join(", ")}

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

        const json = (await resp.json()) as { categoria?: string };
        if (json.categoria) {
          setCategoria(json.categoria);
        }
      } catch (e) {
        console.error("Error IA:", e);
      }
    },
    [categoriasDisponibles]
  );

  // Detectar categoría cuando el usuario escribe
  useEffect(() => {
    if (editItem) return;
    const timer = setTimeout(() => {
      void categorizarAutomaticamente(descripcion);
    }, 0);
    return () => clearTimeout(timer);
  }, [descripcion, editItem, categorizarAutomaticamente]);

  // ==========================
  // Submit
  // ==========================
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const categoriaSeleccionada = categoria || categoriasDisponibles[0] || "Otros";

    onSave({
      descripcion,
      monto: Number(monto),
      fecha,
      categoria: categoriaSeleccionada,
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
          <option value="">Seleccioná una categoría</option>
          {categoriasDisponibles.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
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
