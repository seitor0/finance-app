"use client";

import clsx from "clsx";
import { useApp } from "@/context/AppContext";

type Props = {
  className?: string;
  variant?: "default" | "hero";
};

export default function WidgetDisponible({ className = "", variant = "default" }: Props) {
  const { dineroDisponible } = useApp();

  const bruto = Number(dineroDisponible ?? 0);
  const esPositivo = bruto >= 0;
  const color = esPositivo ? "text-emerald-300" : "text-rose-200";
  const textoPrincipal = esPositivo ? "Disponible" : "Saldo negativo";
  const monto = Math.abs(bruto).toLocaleString("es-AR");

  const isHero = variant === "hero";

  return (
    <div
      className={clsx(
        "rounded-3xl shadow relative overflow-hidden",
        isHero
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white"
          : "bg-white",
        className
      )}
    >
      <div className={clsx("p-6", !isHero && "text-slate-800")}
      >
        <p className={clsx("text-sm font-semibold tracking-wide", isHero ? "text-white/80" : "text-slate-500")}
        >
          {textoPrincipal}
        </p>
        <p className={clsx("text-4xl md:text-5xl font-bold my-3", isHero ? color : esPositivo ? "text-emerald-600" : "text-rose-600")}
        >
          {esPositivo ? "+" : "-"}${monto}
        </p>
        <p className={clsx("text-xs", isHero ? "text-white/60" : "text-slate-400")}
        >
          (Ingresos – Gastos)
        </p>
      </div>
    </div>
  );
}
