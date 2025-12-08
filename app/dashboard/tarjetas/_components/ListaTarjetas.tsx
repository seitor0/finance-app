"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CreditCard, Loader2 } from "lucide-react";

import { useApp, type PendienteTarjeta } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";

export default function ListaTarjetas() {
  const { user } = useAuth();
  const { pendientesTarjeta, loadingData, liquidarCiclo } = useApp();
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const ordenadas = useMemo(
    () =>
      pendientesTarjeta.map((grupo) => ({
        ...grupo,
        compras: [...grupo.compras].sort((a, b) => a.fecha.localeCompare(b.fecha)),
      })),
    [pendientesTarjeta]
  );

  const handleLiquidar = async (grupo: PendienteTarjeta) => {
    if (!user) return;
    const key = `${grupo.tarjeta_id}-${grupo.ciclo_id}`;
    setProcessingKey(key);
    setActionError(null);
    try {
      await liquidarCiclo(grupo.tarjeta_id, grupo.ciclo_id, grupo.compras);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError("Ocurrió un error al liquidar el ciclo.");
      }
    } finally {
      setProcessingKey(null);
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
          {ordenadas.length} ciclos pendientes
        </span>
      </div>

      {actionError && (
        <p className="mb-3 rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {actionError}
        </p>
      )}

      {loadingData ? (
        <div className="flex items-center justify-center py-10 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Cargando movimientos...
        </div>
      ) : ordenadas.length === 0 ? (
        <p className="text-sm text-slate-500">
          No hay gastos con tarjeta pendientes. ¡Todo al día!
        </p>
      ) : (
        <ul className="space-y-5">
          {ordenadas.map((grupo) => {
            const key = `${grupo.tarjeta_id}-${grupo.ciclo_id}`;
            const pagoLabel = grupo.fecha_pago
              ? new Date(grupo.fecha_pago).toLocaleDateString("es-AR")
              : "Sin fecha";
            const periodoLabel =
              grupo.ciclo_desde && grupo.ciclo_hasta
                ? `${new Date(grupo.ciclo_desde).toLocaleDateString("es-AR")} → ${new Date(
                    grupo.ciclo_hasta
                  ).toLocaleDateString("es-AR")}`
                : "Período no disponible";

            return (
              <li
                key={key}
                className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4"
              >
                <div className="flex flex-col gap-3 border-b border-slate-200 pb-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-slate-900">
                      <CreditCard className="h-4 w-4 text-slate-500" />
                      <p className="font-semibold">
                        {grupo.tarjeta_nombre} · Ciclo {grupo.ciclo_id}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">{periodoLabel}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {grupo.cantidad} compra{grupo.cantidad === 1 ? "" : "s"} · Total{" "}
                      {grupo.total.toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-2 text-sm text-slate-500 md:items-end">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      Paga el {pagoLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleLiquidar(grupo)}
                      disabled={processingKey === key}
                      className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 disabled:opacity-60"
                    >
                      {processingKey === key ? "Liquidando..." : "Liquidar ahora"}
                    </button>
                  </div>
                </div>

                <ul className="mt-3 space-y-2">
                  {grupo.compras.map((mov) => (
                    <li
                      key={mov.id}
                      className="flex flex-col justify-between text-sm text-slate-600 gap-1 md:flex-row md:items-center"
                    >
                      <span className="font-medium text-slate-700">{mov.descripcion}</span>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>{new Date(mov.fecha).toLocaleDateString("es-AR")}</span>
                        <span>
                          {toCurrency(mov.monto)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function toCurrency(value: number) {
  return Number(value || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}
