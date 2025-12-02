import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { texto } = await req.json();
  const t = texto.toLowerCase();

  const hoy = new Date().toISOString().split("T")[0];

  // -----------------------------
  // COMPRA USD
  // Ej: "compré 200 usd a 1300"
  // -----------------------------
  const compraRegex = /compr(é|e)\s+(\d+)\s+(usd|dólares?)(?:.*?a\s+(\d+))/;
  const compra = t.match(compraRegex);

  if (compra) {
    const usd = Number(compra[2]);
    const precio = Number(compra[4]);
    return NextResponse.json({
      tipo: "compra-usd",
      usd,
      arsGasto: usd * precio,
      descripcion: "Compra de USD",
      fecha: hoy,
    });
  }

  // -----------------------------
  // VENTA USD
  // -----------------------------
  const ventaRegex = /vend(í|i)\s+(\d+)\s+(usd|dólares?)(?:.*?a\s+(\d+))/;
  const venta = t.match(ventaRegex);

  if (venta) {
    const usd = Number(venta[2]);
    const precio = Number(venta[4]);
    return NextResponse.json({
      tipo: "venta-usd",
      usd,
      arsIngreso: usd * precio,
      descripcion: "Venta de USD",
      fecha: hoy,
    });
  }

  // -----------------------------
  // AHORRO → MUCHOS CASOS NUEVOS
  // -----------------------------
  const ahorroRegex =
    /(ahorr(é|e)|guard(é|e)|separ(é|e)|puse|pas(é|e))\s+(\d+)\s+(usd|dólares?)/;

  const ahorro = t.match(ahorroRegex);

  if (ahorro) {
    const usd = Number(ahorro[7]);
    return NextResponse.json({
      tipo: "ahorro",
      usd,
      descripcion: "Ahorro",
      fecha: hoy,
    });
  }

  // -----------------------------
  // GASTO → acepta frases largas
  // -----------------------------
  const gastoRegex = /(gast(é|e)|pagu(é|e)).*?(\d+)/;
  const gasto = t.match(gastoRegex);

  if (gasto) {
    return NextResponse.json({
      tipo: "gasto",
      monto: Number(gasto[3]),
      descripcion: texto,
      fecha: hoy,
    });
  }

  // -----------------------------
  // INGRESO
  // -----------------------------
  const ingresoRegex = /(cobr(é|e)|ingres(ó|o)).*?(\d+)/;
  const ingreso = t.match(ingresoRegex);

  if (ingreso) {
    return NextResponse.json({
      tipo: "ingreso",
      monto: Number(ingreso[4]),
      descripcion: texto,
      fecha: hoy,
    });
  }

  // -----------------------------
  // DESCONOCIDO
  // -----------------------------
  return NextResponse.json({
    tipo: "desconocido",
    msg: "No pude interpretar el texto",
  });
}
