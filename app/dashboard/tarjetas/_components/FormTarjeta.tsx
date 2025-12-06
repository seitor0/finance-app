"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useApp } from "@/context/AppContext";

type FormState = {
  descripcion: string;
  monto: string;
  tarjeta: string;
  fechaCompra: string;
  fechaPago: string;
};

const initialState = (): FormState => {
  const hoy = new Date().toISOString().slice(0, 10);
  return {
    descripcion: "",
    monto: "",
    tarjeta: "",
    fechaCompra: hoy,
    fechaPago: hoy,
  };
};

export default function FormTarjeta() {
  const { agregarGastoTarjeta } = useApp();
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.descripcion.trim() || !form.tarjeta.trim()) {
      setError("Completá la descripción y la tarjeta");
      return;
    }

    const montoNumber = Number(form.monto);
    if (!Number.isFinite(montoNumber) || montoNumber <= 0) {
      setError("Ingresá un monto válido");
      return;
    }

    setLoading(true);
    try {
      await agregarGastoTarjeta({
        descripcion: form.descripcion.trim(),
        monto: montoNumber,
        fecha: form.fechaCompra,
        categoria: "Tarjeta",
        tipo: "Tarjeta",
        tarjeta: form.tarjeta.trim(),
        fecha_pago: form.fechaPago,
      });
      setSuccess("Gasto con tarjeta cargado");
      setForm(initialState());
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar el gasto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Cargar gasto con tarjeta</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Descripción
          </label>
          <input
            type="text"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Ej: Compra supermercado"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Monto (ARS)
            </label>
            <input
              type="number"
              name="monto"
              min="0"
              step="0.01"
              value={form.monto}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Tarjeta
            </label>
            <input
              type="text"
              name="tarjeta"
              value={form.tarjeta}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Visa, Amex, etc."
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Fecha de compra
            </label>
            <input
              type="date"
              name="fechaCompra"
              value={form.fechaCompra}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Fecha de pago
            </label>
            <input
              type="date"
              name="fechaPago"
              value={form.fechaPago}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
            {error}
          </p>
        )}

        {success && (
          <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-2xl px-3 py-2">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-blue-600 text-white py-3 text-sm font-semibold shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Registrar gasto"}
        </button>
      </form>
    </div>
  );
}
