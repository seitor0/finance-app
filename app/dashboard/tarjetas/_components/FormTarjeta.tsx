"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";

import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

type FormState = {
  descripcion: string;
  monto: string;
  tarjetaId: string;
  fechaCompra: string;
  fechaPago: string;
};

const initialState = (): FormState => {
  const hoy = new Date().toISOString().slice(0, 10);
  return {
    descripcion: "",
    monto: "",
    tarjetaId: "",
    fechaCompra: hoy,
    fechaPago: hoy,
  };
};

export default function FormTarjeta() {
  const { agregarGastoTarjeta } = useApp();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tarjetas, setTarjetas] = useState<any[]>([]);
  const [loadingTarjetas, setLoadingTarjetas] = useState(true);
  const [tarjetasError, setTarjetasError] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!user) {
      setTarjetas([]);
      setLoadingTarjetas(false);
      return;
    }

    setLoadingTarjetas(true);
    const ref = collection(db, "usuarios", user.uid, "tarjetas");
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setTarjetas(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
        );
        setLoadingTarjetas(false);
        setTarjetasError(null);
      },
      () => {
        setTarjetasError("No se pudo cargar tus tarjetas.");
        setLoadingTarjetas(false);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.descripcion.trim()) {
      setError("Completá la descripción");
      return;
    }

    const montoNumber = Number(form.monto);
    if (!Number.isFinite(montoNumber) || montoNumber <= 0) {
      setError("Ingresá un monto válido");
      return;
    }

    if (!form.tarjetaId) {
      setError("Seleccioná una tarjeta antes de guardar.");
      return;
    }

    const tarjetaSeleccionada = tarjetas.find((t) => t.id === form.tarjetaId);
    if (!tarjetaSeleccionada) {
      setError("La tarjeta seleccionada ya no existe.");
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
        tarjeta: tarjetaSeleccionada.nombre,
        tarjeta_id: tarjetaSeleccionada.id,
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
            <select
              name="tarjetaId"
              value={form.tarjetaId}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              disabled={loadingTarjetas || tarjetas.length === 0}
            >
              <option value="">
                {loadingTarjetas ? "Cargando tarjetas..." : "Seleccioná una tarjeta"}
              </option>
              {tarjetas.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                  {t.banco ? ` · ${t.banco}` : ""}
                </option>
              ))}
            </select>
            {tarjetasError && (
              <p className="mt-2 text-xs text-rose-600">{tarjetasError}</p>
            )}
            {tarjetas.length === 0 && !loadingTarjetas && !tarjetasError && (
              <p className="mt-2 text-xs text-slate-500">
                No tenés tarjetas guardadas.
                <Link
                  href="/dashboard/configuracion"
                  className="ml-1 text-blue-600 underline"
                >
                  Agregá una tarjeta desde Configuración
                </Link>
                .
              </p>
            )}
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
