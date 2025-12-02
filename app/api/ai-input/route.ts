import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { texto } = await req.json();

    if (!texto || texto.trim().length === 0) {
      return NextResponse.json({ error: "Texto vacío" }, { status: 400 });
    }

    const lower = texto.toLowerCase();

    // ----------------------------
    // 1) EXTRAER MONTO
    // ----------------------------
    const montoMatch = texto.match(/(\d[\d\.]*)/);
    const monto = montoMatch ? Number(montoMatch[1].replace(/\./g, "")) : null;

    // ----------------------------
    // 2) DETECTAR FECHA (por ahora hoy)
    // ----------------------------
    const fecha = new Date().toISOString().slice(0, 10);

    // ----------------------------
    // 3) DETECTAR TIPO
    // ----------------------------
    let tipo: "gasto" | "ingreso" | "ahorro" | "compra-usd" | "venta-usd" = "gasto";

    if (lower.includes("cobré") || lower.includes("ingresó") || lower.includes("me pagaron")) {
      tipo = "ingreso";
    }

    if (lower.includes("ahorro") || lower.includes("guardé") || lower.includes("compré dólares")) {
      tipo = "ahorro";
    }

    if (lower.includes("compré dólares") || lower.includes("compra usd")) {
      tipo = "compra-usd";
    }

    if (lower.includes("vendí dólares") || lower.includes("venta usd")) {
      tipo = "venta-usd";
    }

    // ----------------------------
    // 4) DETECTAR CATEGORÍA
    // ----------------------------
    const mapaCategorias: Record<string, string> = {
      alquiler: "Alquiler",
      expensas: "Expensas",
      supermercado: "Supermercado",
      super: "Supermercado",
      tarjeta: "Tarjeta",
      viaticos: "Gastos fijos",
      viático: "Gastos fijos",
      viáticos: "Gastos fijos",
      luz: "Servicios",
      gas: "Servicios",
      agua: "Servicios",
      internet: "Servicios",
      comida: "Comida",
      netflix: "Servicios",
      gimnasio: "Salud",
      seguro: "Seguros",
    };

    let categoriaDetectada = "Otros";

    for (const palabra in mapaCategorias) {
      if (lower.includes(palabra)) {
        categoriaDetectada = mapaCategorias[palabra];
        break;
      }
    }

    // ----------------------------
    // 5) LIMPIAR DESCRIPCIÓN
    // ----------------------------
    const descripcionLimpia = texto.replace(/\d[\d\.]*/g, "").trim();

    // ----------------------------
    // RESPUESTA FINAL
    // ----------------------------
    return NextResponse.json({
      tipo,
      descripcion: descripcionLimpia,
      monto: monto ?? 0,
      fecha,
      categoria: categoriaDetectada,
    });

  } catch (e) {
    console.error("Error en IA:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
