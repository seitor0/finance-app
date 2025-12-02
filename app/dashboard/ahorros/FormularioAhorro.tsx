"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export default function FormularioAhorro({ onClose, onSuccess }: Props) {
  const { agregarAhorro } = useApp();

  const [usd, setUsd] = useState<number>(0);
  const [nota, setNota] = useState("");
  const [loading, setLoading] = useState(false);

  async function guardar() {
    if (!usd || usd <= 0) return;

    setLoading(true);
    try {
      await agregarAhorro({
        usd,
        fecha: new Date().toISOString().split("T")[0],
        notas: nota || "Ahorro manual",
      });

      onSuccess();
    } catch (err) {
      console.error("Error guardando ahorro:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-lg font-semibold">Registrar ahorro</h3>

      <div className="flex flex-col gap-1">
        <label className="text-slate-600">Monto en USD</label>
        <input
          type="number"
          value={usd}
          onChange={(e) => setUsd(Number(e.target.value))}
          className="border p-2 rounded-xl bg-white/60 focus:bg-white"
          placeholder="Ej: 200"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-slate-600">Notas (opcional)</label>
        <input
          type="text"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          className="border p-2 rounded-xl bg-white/60 focus:bg-white"
          placeholder="Ej: Ahorro extra"
        />
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={guardar}
          disabled={loading || usd <= 0}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar ahorro"}
        </button>

        <button
          onClick={onClose}
          className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-800 py-2 rounded-xl"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
