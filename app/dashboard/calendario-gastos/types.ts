import type { Movimiento } from "@/context/AppContext";

export type DaySummary = {
  date: string;
  total: number;
  categoriaPrincipal: string | null;
  gastos: Movimiento[];
  isCurrentYear: boolean;
};
