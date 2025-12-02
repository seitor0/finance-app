export type AIParsedResult = {
  tipo: "Gasto" | "Ingreso";  // ahora coincide 100%
  descripcion: string;
  monto: number;
  categoria?: string;
  fecha?: string; // la agregamos en saveFromAI
};
