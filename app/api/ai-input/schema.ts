function detectarCategoria(texto: string): string {
  const t = texto.toLowerCase();

  if (t.includes("alquiler") || t.includes("renta")) return "Alquiler";
  if (t.includes("expensa")) return "Expensas";
  if (t.includes("tarjeta") || t.includes("naranja") || t.includes("visa") || t.includes("master")) return "Tarjeta";
  if (t.includes("luz") || t.includes("gas") || t.includes("agua") || t.includes("servicio")) return "Servicios";
  if (t.includes("super") || t.includes("kilo") || t.includes("mercado")) return "Supermercado";
  if (t.includes("nafta") || t.includes("subte") || t.includes("colectivo") || t.includes("uber")) return "Transporte";
  if (t.includes("medico") || t.includes("salud") || t.includes("obra social")) return "Salud";
  if (t.includes("colegio") || t.includes("cuota") || t.includes("educación")) return "Educación";
  if (t.includes("viatico") || t.includes("viáticos") || t.includes("viaje")) return "Viáticos";
  if (t.includes("carmela")) return "Gastos fijos"; // ❤️ tu caso

  return "Otros";
}


// ---- Tipos que usa el dashboard ----

export type ResultadoIA =
  | {
      tipo: "gasto" | "ingreso";
      descripcion: string;
      monto: number | null;
      fecha: string; // yyyy-mm-dd
    }
  | {
      tipo: "ahorro";
      usd: number;
      fecha: string;
      notas?: string;
    }
  | {
      tipo: "compra-usd";
      usd: number;
      arsGasto: number;
      fecha: string;
    }
  | {
      tipo: "venta-usd";
      usd: number;
      arsIngreso: number;
      fecha: string;
    };

// ---- Helpers ----

// Convierte "25.000" o "10.000,50" en número
function toNumber(raw: string): number | null {
  if (!raw) return null;
  const limpio = raw.replace(/\./g, "").replace(",", ".");
  const n = Number(limpio);
  return Number.isNaN(n) ? null : n;
}

// Devuelve todos los números que encuentra en el texto
function extraerNumeros(texto: string): number[] {
  const regex =
    /(\d{1,3}(?:\.\d{3})*(?:,\d+)?|\d+(?:,\d+)?)/g; // 25.000 / 1.234,56 / 10000
  const matches = texto.match(regex) ?? [];
  const nums = matches
    .map((m) => toNumber(m))
    .filter((n): n is number => n !== null);
  return nums;
}

// Fecha hoy en formato yyyy-mm-dd
function hoyISO(): string {
  return new Date().toISOString().split("T")[0];
}

// ---- Lógica principal ----

export function parseFinanceText(texto: string): ResultadoIA {
  const lower = texto.toLowerCase();

  const numeros = extraerNumeros(texto);
  const montoPrincipal: number | null =
    numeros.length > 0 ? numeros[numeros.length - 1] : null;

  // Flags por palabras clave
  const hayUSD =
    /usd|u\$d|u$s|dólar|dolar|dólares|dolares/.test(lower);

  const esGasto =
    /gast[éeó]|pagu[éeó]|pag[oó]|compr[éeó]|abon[éeó]|invert[ií]/.test(lower);
  const esIngreso =
    /cobr[éeó]|me pagaron|entr[oó]|ingres[oó]|factur[éeó]|depositar(?:on)?/.test(
      lower
    );

  const esAhorro =
    /ahorro|ahorr[éeó]|guard[éeó] (plata|dinero|algo)/.test(lower);

  const esCompraUSD =
    hayUSD &&
    /(compr[éeó]|comprar|pas[éeó] a d[oó]lares|cambi[éeó] a d[oó]lares)/.test(
      lower
    );
  const esVentaUSD =
    hayUSD &&
    /(vend[íi]|vender|cambi[éeó] a pesos|pas[éeó] a pesos)/.test(lower);

  // ---- Casos especiales USD ----

  if (esCompraUSD) {
    // Ej: "Compré 200 USD a 1500" -> números: [200, 1500]
    let usd = 0;
    let arsGasto = 0;

    if (numeros.length === 1) {
      // Si solo hay un número, lo tomamos como ARS y dejamos USD genérico 0
      arsGasto = numeros[0];
    } else if (numeros.length >= 2) {
      // Tomamos el más chico como USD y el más grande como ARS
      usd = Math.min(...numeros);
      arsGasto = Math.max(...numeros);
    }

    return {
      tipo: "compra-usd",
      usd,
      arsGasto,
      fecha: hoyISO(),
    };
  }

  if (esVentaUSD) {
    // Ej: "Vendí 300 USD y me dieron 450.000" -> [300, 450000]
    let usd = 0;
    let arsIngreso = 0;

    if (numeros.length === 1) {
      usd = numeros[0];
    } else if (numeros.length >= 2) {
      usd = Math.min(...numeros);
      arsIngreso = Math.max(...numeros);
    }

    return {
      tipo: "venta-usd",
      usd,
      arsIngreso,
      fecha: hoyISO(),
    };
  }

  // ---- Ahorro (sin compra/venta de USD) ----
  if (esAhorro && hayUSD) {
    // "Ahorré 100 USD"
    const usd = montoPrincipal ?? 0;
    return {
      tipo: "ahorro",
      usd,
      fecha: hoyISO(),
      notas: texto.trim(),
    };
  }

  // ---- Ingreso / Gasto en ARS ----

  let tipo: "gasto" | "ingreso" = "gasto";

  if (esIngreso && !esGasto) {
    tipo = "ingreso";
  } else if (esGasto && !esIngreso) {
    tipo = "gasto";
  } else if (esIngreso && esGasto) {
    // Si dice cosas mixtas, priorizamos gasto salvo que diga "cobré" fuerte
    tipo = /cobr[éeó]/.test(lower) ? "ingreso" : "gasto";
  } else {
    // Si no detectamos nada, asumimos gasto (es lo más común)
    tipo = "gasto";
  }

  return {
    tipo,
    descripcion: texto.trim(),
    monto: montoPrincipal,
    fecha: hoyISO(),
  };
}
