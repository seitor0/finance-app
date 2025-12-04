export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ============================
   NORMALIZAR FECHA
============================ */
function normalizarFecha(texto: string) {
  if (!texto) return new Date().toISOString().slice(0, 10);

  const hoy = new Date();

  // HOY
  if (/hoy/i.test(texto)) {
    return hoy.toISOString().slice(0, 10);
  }

  // AYER
  if (/ayer/i.test(texto)) {
    const d = new Date(hoy);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  // DÍAS DE SEMANA
  const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const index = dias.findIndex((d) => texto.toLowerCase().includes(d));

  if (index !== -1) {
    const d = new Date(hoy);
    const hoyIndex = d.getDay();
    let diff = index - hoyIndex;
    if (diff > 0) diff -= 7; // siempre para atrás
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
  }

  // FORMATO ISO VALIDO
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return texto;
  }

  // DEFAULT
  return hoy.toISOString().slice(0, 10);
}

/* ============================
   NORMALIZAR MONTO
   (SIEMPRE DEVUELVE 12.345 o 1.234.567)
============================ */
function normalizarMonto(valor: any) {
  if (!valor) return "0";

  let num = Number(String(valor).replace(/\./g, "").replace(/,/g, ""));

  if (isNaN(num)) num = 0;

  // Insertar puntos cada 3 dígitos
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/* ============================
   POST / IA
============================ */
export async function POST(req: Request) {
  try {
    const { texto } = await req.json();

    const prompt = `
Interpretá el mensaje y devolvé SOLO el siguiente JSON válido:

{
  "tipo": "gasto" | "ingreso",
  "categoria": "string",
  "descripcion": "string",
  "monto": number,
  "fecha": "YYYY-MM-DD"
}

### CATEGORÍAS DISPONIBLES
Kiosco, Supermercado, Salidas, Impuestos, Servicios, Mascota, Farmacia,
Alquiler, Librería, Suscripciones, Tarjetas, Compras, Otros

### REGLAS
- La descripción NO debe incluir “hoy”, “ayer”, “pagué”, “gasté”.
- Detectar fecha automáticamente (hoy/ayer/el lunes/fechas escritas).
- salvo que se indique lo contrario siempre usar año corriente.
- El monto debe ser número limpio.
- La categoría debe ser EXACTAMENTE una del listado.

### EJEMPLOS
"Hoy pagué gas 89000" → gasto, Servicios, Pago de gas, 89000, fecha de hoy
"Compré juguetes" → gasto, Compras, Compra de juguetes
"Me pagaron 150000 del trabajo" → ingreso, Otros, Pago trabajo
`;

    const chat = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: texto },
      ],
      temperature: 0.2,
      max_tokens: 300,
    });

    const raw = chat.choices[0]?.message?.content?.trim();
    let parsed = {};

    try {
      parsed = JSON.parse(raw ?? "{}");
    } catch {
      parsed = {};
    }

    const fechaNormalizada = normalizarFecha((parsed as any).fecha);
    const montoNormalizado = normalizarMonto((parsed as any).monto);

    const respuestaFinal = {
      ...parsed,
      fecha: fechaNormalizada,
      monto: montoNormalizado,
    };

    return new Response(JSON.stringify(respuestaFinal), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Error procesando IA", detalle: String(err) }),
      { status: 500 }
    );
  }
}
