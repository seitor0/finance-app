import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { texto } = await req.json();
  const t = texto.toLowerCase();

  // --------------------------------------
  // COMPRA DE DÓLARES
  // "compré 300 dólares a 1300"
  // --------------------------------------
  const compraRegex = /compr(é|e)\s+(\d+)\s+(usd|dólares?)(?:.*?a\s+(\d+))/;
  const compra = t.match(compraRegex);

  if (compra) {
    const usd = Number(compra[2]);
    const precio = Number(compra[4]);
    const ars = usd * precio;

    return NextResponse.json({
      tipo: "compra-usd",
      usd,
      arsGasto: ars,
      descripcion: `Compra de USD`,
      fecha: new Date().toISOString().split("T")[0],
    });
  }

  // --------------------------------------
  // VENTA DE DÓLARES
  // --------------------------------------
  const ventaRegex = /vend(í|i)\s+(\d+)\s+(usd|dólares?)(?:.*?a\s+(\d+))/;
  const venta = t.match(ventaRegex);

  if (venta) {
    const usd = Number(venta[2]);
    const precio = Number(venta[4]);
    const ars = usd * precio;

    return NextResponse.json({
      tipo: "venta-usd",
      usd,
      arsIngreso: ars,
      descripcion: `Venta de USD`,
      fecha: new Date().toISOString().split("T")[0],
    });
  }

  // --------------------------------------
  // AHORRO DIRECTO
  // "ahorré 200 dólares"
  // --------------------------------------
  const ahorroRegex = /ahorr(é|e)\s+(\d+)\s+(usd|dólares?)/;
  const ahorro = t.match(ahorroRegex);

  if (ahorro) {
    const usd = Number(ahorro[2]);

    return NextResponse.json({
      tipo: "ahorro",
      usd,
      descripcion: "Ahorro manual",
      fecha: new Date().toISOString().split("T")[0],
    });
  }

  // --------------------------------------
  // GASTO
  // --------------------------------------
  const gastoRegex = /(gast(é|e)|pagu(é|e))\s+(\d+)/;
  const gasto = t.match(gastoRegex);

  if (gasto) {
    return NextResponse.json({
      tipo: "gasto",
      monto: Number(gasto[5]),
      descripcion: texto,
      fecha: new Date().toISOString().split("T")[0],
    });
  }

  // --------------------------------------
  // INGRESO
  // --------------------------------------
  const ingresoRegex = /(cobr(é|e)|ingres(ó|o))\s+(\d+)/;
  const ingreso = t.match(ingresoRegex);

  if (ingreso) {
    return NextResponse.json({
      tipo: "ingreso",
      monto: Number(ingreso[4]),
      descripcion: texto,
      fecha: new Date().toISOString().split("T")[0],
    });
  }

  return NextResponse.json({
    tipo: "desconocido",
    msg: "No pude interpretar el texto",
  });
}
