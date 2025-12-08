export type Ciclo = {
  ciclo_id: string;
  desde: Date;
  hasta: Date;
  fecha_pago: Date;
};

export function ultimoDiaDelMes(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

function clampDiaEnMes(dia: number, year: number, month0: number): number {
  const max = ultimoDiaDelMes(year, month0);
  if (dia <= 1) return 1;
  if (dia >= max) return max;
  return dia;
}

function addDays(base: Date, amount: number): Date {
  const next = new Date(base);
  next.setDate(base.getDate() + amount);
  return next;
}

function normalizarFecha(fecha: Date | string): Date {
  if (fecha instanceof Date) {
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  }

  if (typeof fecha === "string") {
    const [yearStr, monthStr, dayStr] = fecha.split("-");
    if (yearStr && monthStr && dayStr) {
      const year = Number(yearStr);
      const month = Number(monthStr) - 1;
      const day = Number(dayStr);
      if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
        return new Date(year, month, day);
      }
    }
  }

  const parsed = new Date(fecha);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Fecha inválida al calcular el ciclo");
  }
  return parsed;
}

export function formatoInputDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function calcularCiclo(
  fechaCompraInput: Date | string,
  diaCierre: number,
  diaVencimiento: number
): Ciclo {
  if (!diaCierre || !diaVencimiento) {
    throw new Error("La tarjeta no tiene configurados los días de cierre y vencimiento.");
  }

  const fechaCompra = normalizarFecha(fechaCompraInput);
  const compraYear = fechaCompra.getFullYear();
  const compraMonth = fechaCompra.getMonth();
  const compraDia = fechaCompra.getDate();

  let cierreYear = compraYear;
  let cierreMonth = compraMonth;
  const diaCierreActual = clampDiaEnMes(diaCierre, compraYear, compraMonth);

  if (compraDia > diaCierreActual) {
    const siguienteMes = new Date(compraYear, compraMonth, 1);
    siguienteMes.setMonth(siguienteMes.getMonth() + 1);
    cierreYear = siguienteMes.getFullYear();
    cierreMonth = siguienteMes.getMonth();
  }

  const cierreDia = clampDiaEnMes(diaCierre, cierreYear, cierreMonth);
  const hasta = new Date(cierreYear, cierreMonth, cierreDia);

  const mesAnterior = new Date(cierreYear, cierreMonth, 1);
  mesAnterior.setMonth(mesAnterior.getMonth() - 1);
  const cierreAnteriorDia = clampDiaEnMes(diaCierre, mesAnterior.getFullYear(), mesAnterior.getMonth());
  const cierreAnterior = new Date(
    mesAnterior.getFullYear(),
    mesAnterior.getMonth(),
    cierreAnteriorDia
  );
  const desde = addDays(cierreAnterior, 1);

  const mesPago = new Date(cierreYear, cierreMonth, 1);
  mesPago.setMonth(mesPago.getMonth() + 1);
  const pagoDia = clampDiaEnMes(diaVencimiento, mesPago.getFullYear(), mesPago.getMonth());
  const fecha_pago = new Date(mesPago.getFullYear(), mesPago.getMonth(), pagoDia);

  const ciclo_id = `${hasta.getFullYear()}-${String(hasta.getMonth() + 1).padStart(2, "0")}`;

  return {
    ciclo_id,
    desde,
    hasta,
    fecha_pago,
  };
}
