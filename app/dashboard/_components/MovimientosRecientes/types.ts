export type Movimiento = {
  id: string;
  tipo: "Ingreso" | "Gasto";
  descripcion: string;
  monto: number;
  fecha: string;
};
