"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { CreditCard, CalendarDays, Loader2 } from "lucide-react";

import type { Movimiento } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

type TarjetaMovimiento = Movimiento & {
  tarjeta?: string;
  fecha_pago?: string;
  liquidado?: boolean;
};

export default function ListaTarjetas() {
  const { user } = useAuth();
  const [movimientos, setMovimientos] = useState<TarjetaMovimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setMovimientos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const ref = collection(db, "usuarios", user.uid, "movimientos");
    const q = query(
      ref,
      where("tipo", "==", "Tarjeta"),
      where("liquidado", "==", false),
      orderBy("fecha_pago", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setMovimientos(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as TarjetaMovimiento[]
        );
        setLoading(false);
      },
      () => {
        setError("No se pudo cargar la información, intentá nuevamente.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user?.uid]);

  const marcarComoPagado = async (mov: TarjetaMovimiento) => {
    if (!user) return;
    setProcessingId(mov.id);
    try {
      await updateDoc(doc(db, "usuarios", user.uid, "movimientos", mov.id), {
        liquidado: true,
      });
    } catch (error) {
      console.error("No se pudo actualizar el movimiento", error);
    } finally {
      setProcessingId(null);
    }
  };

  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Iniciá sesión para ver tus gastos con tarjeta.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Pendientes de tarjeta</h2>
        <span className="text-sm text-slate-500">
          {movimientos.length} pendientes
        </span>
      </div>

      {error && (
        <p className="mb-3 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cargando movimientos...
        </div>
      ) : movimientos.length === 0 ? (
        <p className="text-sm text-slate-500">
          No hay gastos con tarjeta todavía.
        </p>
      ) : (
        <ul className="space-y-4">
          {movimientos.map((mov) => (
            <li
              key={mov.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-500" />
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {mov.descripcion}
                  </p>
                </div>
                <p className="text-sm text-slate-500">
                  Tarjeta: {mov.tarjeta || "Sin especificar"}
                </p>
                <p className="text-sm text-slate-500">
                  Monto: {Number(mov.monto || 0).toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>

              <div className="flex flex-col gap-2 text-sm text-slate-500">
                {mov.fecha_pago && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                    <CalendarDays className="h-4 w-4 text-slate-400" />
                    Paga el {new Date(mov.fecha_pago).toLocaleDateString("es-AR")}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => marcarComoPagado(mov)}
                  disabled={processingId === mov.id}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 disabled:opacity-60"
                >
                  {processingId === mov.id ? "Actualizando..." : "Marcar como pagado"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
