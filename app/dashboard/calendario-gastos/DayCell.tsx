"use client";

import type { MouseEvent } from "react";
import clsx from "clsx";
import type { DaySummary } from "./types";

interface Props {
  day: DaySummary;
  color: string;
  isSelected: boolean;
  onSelect: (day: DaySummary) => void;
  onHover: (day: DaySummary, position: { x: number; y: number }) => void;
  onHoverEnd: () => void;
}

const formatDateForLabel = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });
};

export default function DayCell({ day, color, isSelected, onSelect, onHover, onHoverEnd }: Props) {
  const label = formatDateForLabel(day.date);
  const disabled = !day.isCurrentYear;

  const handleHover = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onHover(day, { x: event.clientX + 12, y: event.clientY + 12 });
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onSelect(day);
      }}
      onMouseEnter={handleHover}
      onMouseMove={handleHover}
      onMouseLeave={onHoverEnd}
      aria-label={`${label} - ${
        day.total > 0 ? `${day.total.toLocaleString("es-AR")}` : "Sin gastos"
      }`}
      className={clsx(
        "h-6 w-6 rounded-md border border-black/5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
        isSelected && !disabled && "ring-2 ring-emerald-400 ring-offset-2 ring-offset-white scale-110",
        disabled && "cursor-default opacity-30"
      )}
      style={{ backgroundColor: color }}
    />
  );
}
