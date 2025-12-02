"use client";

import { CheckCircle2, Clock, PauseCircle, AlertTriangle } from "lucide-react";
import { ToPayItem, PaymentStatus } from "@/context/AppContext";
import clsx from "clsx";

function getStatusConfig(status: PaymentStatus) {
  switch (status) {
    case "pagado":
      return {
        label: "Pagado",
        icon: CheckCircle2,
        badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
      };
    case "falta":
      return {
        label: "Falta pagar",
        icon: Clock,
        badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
      };
    case "pospuesto":
      return {
        label: "Pospuesto",
        icon: PauseCircle,
        badgeClass: "bg-violet-100 text-violet-700 border-violet-200",
      };
    default:
      return {
        label: status,
        icon: Clock,
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
      };
  }
}

interface Props {
  item: ToPayItem;
  onToggleStatus?: (next: PaymentStatus) => void;
}

export function ToPayCard({ item, onToggleStatus }: Props) {
  const { label, icon: Icon, badgeClass } = getStatusConfig(item.status);

  const handleCycleStatus = () => {
    if (!onToggleStatus) return;
    const next: PaymentStatus =
      item.status === "falta"
        ? "pospuesto"
        : item.status === "pospuesto"
        ? "pagado"
        : "falta";
    onToggleStatus(next);
  };

  const vencimientoLabel = item.vencimiento
    ? new Date(item.vencimiento).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
      })
    : null;

  return (
    <div
      className={clsx(
        "rounded-3xl border border-white/10 bg-white/70 dark:bg-slate-900/60",
        "backdrop-blur-xl shadow-[0_18px_40px_rgba(15,23,42,0.18)]",
        "p-4 sm:p-5 flex gap-4 items-start transition-all",
        "hover:-translate-y-0.5 hover:shadow-[0_22px_45px_rgba(15,23,42,0.24)]"
      )}
    >
      <button
        type="button"
        onClick={handleCycleStatus}
        className={clsx(
          "mt-1 flex h-10 w-10 items-center justify-center rounded-2xl border",
          "transition-transform hover:scale-105 active:scale-95",
          badgeClass
        )}
        title="Cambiar estado (falta → pospuesto → pagado)"
      >
        <Icon className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-50">
                {item.nombre}
              </h3>
              {item.importante && (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 border border-red-100
                           px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
                >
                  <AlertTriangle className="h-3 w-3" />
                  URGENTE
                </span>
              )}
            </div>

            {item.categoria && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {item.categoria}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span
                className={clsx(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
                  "text-[11px] font-medium",
                  badgeClass
                )}
              >
                <Icon className="h-3 w-3" />
                {label}
              </span>

              {vencimientoLabel && (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 px-2 py-0.5">
                  <Clock className="h-3 w-3" />
                  Vence {vencimientoLabel}
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              {item.monto.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
