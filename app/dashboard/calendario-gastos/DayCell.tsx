"use client";

import type { MouseEvent, ReactNode } from "react";
import clsx from "clsx";
import type { DaySummary } from "./types";

interface Props {
  day: DaySummary;
  color: string;
  isSelected?: boolean;
  disabled?: boolean;
  showDayNumber?: boolean;
  dayNumber?: number;
  variant?: "compact" | "regular" | "large";
  isToday?: boolean;
  onSelect?: (day: DaySummary) => void;
  onHover?: (day: DaySummary, position: { x: number; y: number }) => void;
  onHoverEnd?: () => void;
  className?: string;
  children?: ReactNode;
}

const formatDateForLabel = (day: DaySummary) => {
  const date = day.dateObj;
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });
};

const variantClasses: Record<NonNullable<Props["variant"]>, string> = {
  compact: "h-8 w-8 text-[10px]",
  regular: "min-h-[76px] text-sm",
  large: "h-24 text-base",
};

export default function DayCell({
  day,
  color,
  isSelected = false,
  disabled = false,
  showDayNumber = true,
  dayNumber,
  variant = "compact",
  isToday = false,
  onSelect,
  onHover,
  onHoverEnd,
  className,
  children,
}: Props) {
  const label = formatDateForLabel(day);

  const handleHover = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled || !onHover) return;
    onHover(day, { x: event.clientX + 12, y: event.clientY + 12 });
  };

  const handleClick = () => {
    if (disabled || !onSelect) return;
    onSelect(day);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={handleHover}
      onMouseMove={handleHover}
      onMouseLeave={onHoverEnd}
      aria-label={`${label} - ${
        day.total > 0 ? `${day.total.toLocaleString("es-AR")}` : "Sin gastos"
      }`}
      className={clsx(
        "relative overflow-hidden rounded-2xl border border-black/5 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
        variantClasses[variant],
        isSelected && !disabled && "ring-2 ring-emerald-400 ring-offset-2 ring-offset-white",
        isToday && "border-emerald-400",
        disabled && "cursor-default opacity-40",
        className
      )}
      style={{ backgroundColor: color }}
    >
      {showDayNumber && (
        <span
          className={clsx(
            "pointer-events-none absolute left-2 top-1 font-semibold",
            variant === "compact" ? "text-[10px]" : "text-xs",
            disabled ? "text-slate-400" : "text-slate-800"
          )}
        >
          {dayNumber ?? day.dateObj.getDate()}
        </span>
      )}
      {children}
    </button>
  );
}
