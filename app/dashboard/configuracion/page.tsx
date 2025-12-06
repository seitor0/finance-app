"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

interface TarjetaConfig {
  id: string;
  nombre: string;
  banco?: string;
  cierre?: number;
  vencimiento?: number;
  color?: string;
}

const emptyForm = {
  nombre: "",
  banco: "",
  cierre: "",
  vencimiento: "",
  color: "",
};

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const [tarjetas, setTarjetas] = useState<TarjetaConfig[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setTarjetas([]);
      setListLoading(false);
      return;
    }

    setListLoading(true);
    const ref = collection(db, "usuarios", user.uid, "tarjetas");
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setTarjetas(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as TarjetaConfig[]
        );
        setListLoading(false);
        setListError(null);
      },
      () => {
        setListError("No se pudo cargar tus tarjetas, intentá nuevamente.");
        setListLoading(false);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);

    if (!user) {
      setStatus({ type: "error", message: "Iniciá sesión para gestionar tus tarjetas." });
      return;
    }

    if (!form.nombre.trim()) {
      setStatus({ type: "error", message: "El nombre de la tarjeta es obligatorio." });
      return;
    }

    const payload = {
      nombre: form.nombre.trim(),
      banco: form.banco.trim() || undefined,
      cierre: form.cierre ? Number(form.cierre) : undefined,
      vencimiento: form.vencimiento ? Number(form.vencimiento) : undefined,
      color: form.color.trim() || undefined,
    };

    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, v]) => v !== undefined && v !== null)
    );

    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "usuarios", user.uid, "tarjetas", editingId), cleanPayload);
        setStatus({ type: "success", message: "Tarjeta actualizada correctamente ✅" });
      } else {
        await addDoc(collection(db, "usuarios", user.uid, "tarjetas"), cleanPayload);
        setStatus({ type: "success", message: "Tarjeta agregada correctamente ✅" });
      }
      resetForm();
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "No se pudo guardar la tarjeta." });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (tarjeta: TarjetaConfig) => {
    setForm({
      nombre: tarjeta.nombre,
      banco: tarjeta.banco || "",
      cierre: tarjeta.cierre ? String(tarjeta.cierre) : "",
      vencimiento: tarjeta.vencimiento ? String(tarjeta.vencimiento) : "",
      color: tarjeta.color || "",
    });
    setEditingId(tarjeta.id);
    setStatus(null);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    setStatus(null);
    try {
      await deleteDoc(doc(db, "usuarios", user.uid, "tarjetas", id));
      setStatus({ type: "success", message: "Tarjeta eliminada." });
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", message: "No se pudo eliminar la tarjeta." });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Configuración</h1>
        <p className="text-sm text-slate-500">Administrá tus tarjetas y otros parámetros.</p>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Tarjetas</h2>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-600 mb-1">Nombre *</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Visa BNA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Banco</label>
            <input
              name="banco"
              value={form.banco}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Opcional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Día de cierre</label>
            <input
              type="number"
              min="1"
              max="31"
              name="cierre"
              value={form.cierre}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Ej: 25"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Día de vencimiento</label>
            <input
              type="number"
              min="1"
              max="31"
              name="vencimiento"
              value={form.vencimiento}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Ej: 5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Color / Ícono</label>
            <input
              name="color"
              value={form.color}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Opcional"
            />
          </div>

          {status && (
            <p
              className={`md:col-span-2 rounded-2xl px-3 py-2 text-sm ${
                status.type === "success"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-rose-50 text-rose-600"
              }`}
            >
              {status.message}
            </p>
          )}

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Guardando..." : editingId ? "Actualizar tarjeta" : "Agregar tarjeta"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Cancelar edición
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Listado de tarjetas</h3>
        {listError && (
          <p className="mb-3 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600">{listError}</p>
        )}

        {listLoading ? (
          <p className="text-sm text-slate-500">Cargando tarjetas...</p>
        ) : tarjetas.length === 0 ? (
          <p className="text-sm text-slate-500">Todavía no cargaste tarjetas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase text-slate-500">
                  <th className="px-3 py-2">Nombre</th>
                  <th className="px-3 py-2">Banco</th>
                  <th className="px-3 py-2">Cierre</th>
                  <th className="px-3 py-2">Vencimiento</th>
                  <th className="px-3 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tarjetas.map((t) => (
                  <tr key={t.id} className="text-slate-700">
                    <td className="px-3 py-2 font-semibold">{t.nombre}</td>
                    <td className="px-3 py-2">{t.banco || "—"}</td>
                    <td className="px-3 py-2">{t.cierre ?? "—"}</td>
                    <td className="px-3 py-2">{t.vencimiento ?? "—"}</td>
                    <td className="px-3 py-2 flex gap-2">
                      <button
                        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        onClick={() => handleEdit(t)}
                      >
                        Editar
                      </button>
                      <button
                        className="rounded-lg bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                        onClick={() => handleDelete(t.id)}
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
