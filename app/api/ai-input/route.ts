export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { texto?: string };
    const texto = body?.texto ?? "";

    // FECHA ACTUAL DEL SERVIDOR EN FORMATO YYYY-MM-DD
    const HOY = new Date().toISOString().slice(0, 10);
    const ANIO_ACTUAL = HOY.slice(0, 4);

    const prompt = `
Interpretá el mensaje del usuario y devolvé SOLO este JSON válido, sin texto adicional:

{
  "tipo": "gasto" | "ingreso",
  "categoria": "string",
  "descripcion": "string",
  "monto": number,
  "fecha": "YYYY-MM-DD"
}

FECHA DE REFERENCIA
- Hoy es: ${HOY}
- Todas las referencias temporales ("hoy", "ayer", "el lunes", etc.) deben interpretarse tomando ${HOY} como fecha actual.

REGLAS SOBRE FECHAS
- La fecha SIEMPRE debe estar en formato "YYYY-MM-DD".
- Si el usuario no menciona fecha → usar ${HOY}.
- Si dice "hoy" → usar ${HOY}.
- Si dice "ayer" → usar la fecha inmediatamente anterior a ${HOY}.
- Si dice "el lunes / martes / miércoles / jueves / viernes / sábado / domingo":
  - Buscar SIEMPRE el día de la semana anterior más cercano a ${HOY}.
  - Mantener SIEMPRE el año ${ANIO_ACTUAL}, salvo que el usuario escriba explícitamente otro año.
- Si menciona día y mes pero NO año → usar el año ${ANIO_ACTUAL}.
- Si menciona fecha completa con año → respetar esa fecha tal cual.
- Nunca inventar años que no sean ${ANIO_ACTUAL}, salvo que el usuario escriba otro año explícito.

CATEGORÍAS DISPONIBLES
Kiosco, Supermercado, Salidas, Impuestos, Servicios, Mascota, Farmacia,
Alquiler, Librería, Suscripciones, Tarjetas, Compras, Otros

REGLAS GENERALES
- La descripción NO debe incluir palabras como "hoy", "ayer", "el lunes", "compré", "pagué", "gasté", etc.
- La descripción debe ser corta, limpia y descriptiva (ej: "Compra de alfajores", "Pago de gas").
- El monto debe ser un número entero (sin puntos ni comas como separadores).
- La categoría debe ser EXACTAMENTE una del listado. Si no encaja claramente → usar "Otros".
- Si no se menciona monto → usar 0.
- Si no se entiende si es ingreso o gasto → asumir "gasto".

FORMATO DE RESPUESTA
- Devolver únicamente el JSON.
- No agregar explicaciones, texto adicional ni ejemplos.
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

    return new Response(raw ?? "{}", {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    return new Response(
      JSON.stringify({ error: "Error procesando IA", detalle: String(err) }),
      { status: 500 }
    );
  }
}
