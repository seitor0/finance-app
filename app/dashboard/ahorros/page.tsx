"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import FormularioAhorro from "./FormularioAhorro";

export default function AhorrosPage() {
  const { ahorros, borrarAhorro } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const totalUSD = ahorros.reduce((acc, a) => acc + a.usd, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Ahorros en USD</h1>

        <button
          onClick={() => {
            setEditItem(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl"
        >
          Nuevo ahorro
        </button>
      </div>

      <div className="glass-card p-6">
        <p className="text-sm text-slate-500">Total acumulado</p>
        <h2 className="text-3xl font-bold text-emerald-600">
          USD {totalUSD}
        </h2>
      </div>

      <div className="glass-card p-4">
        {ahorros.length === 0 ? (
          <p className="text-sm text-slate-500">Todavía no registraste ahorros.</p>
        ) : (
          <div className="space-y-3">
            {ahorros.map((a) => (
              <div
                key={a.id}
                className="p-4 bg-white/70 rounded-xl border flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">USD {a.usd}</p>
                  <p className="text-xs text-slate-500">{a.fecha}</p>
                  {a.notas && (
                    <p className="text-xs text-slate-400 mt-1">{a.notas}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditItem(a);
                      setShowForm(true);
                    }}
                    className="px-3 py-1 text-xs bg-slate-200 rounded"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => borrarAhorro(a.id)}
                    className="px-3 py-1 text-xs bg-rose-500 text-white rounded"
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <FormularioAhorro
          editItem={editItem}
          onClose={() => {
            setShowForm(false);
            setEditItem(null);
          }}
        />
      )}
    </div>
  );
}
