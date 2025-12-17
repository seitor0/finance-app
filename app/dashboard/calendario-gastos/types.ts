import type { Movimiento, Ahorro } from "@/context/AppContext";

export type DaySummary = {
  date: string;
  dateObj: Date;
  total: number;
  categoriaPrincipal: string | null;
  gastos: Movimiento[];
};

export type CalendarCell = {
  day: DaySummary;
  isInPeriod: boolean;
};

export type ViewMode = "year" | "month" | "week";

export type ConsultaIA = {
  tipo: "ingreso" | "gasto" | "ahorro";
  categoria?: string;
  periodo: {
    desde: string;
    hasta: string;
  };
  operacion: "sum" | "min" | "max" | "avg";
  dimension?: "month";
};

export type ResumenIA = {
  monto: number;
  operacion: ConsultaIA["operacion"];
  tipo: ConsultaIA["tipo"];
  categoria?: string;
  descripcion: string;
  periodoLabel: string;
  agregado?: {
    etiqueta: string;
    monto: number;
  };
};

export type DatasetIA = Movimiento[] | Ahorro[];
