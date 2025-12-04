export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { texto } = await req.json();

   const prompt = `
Interpretá el mensaje del usuario y devolvé **SOLO** este JSON válido, sin texto adicional:

{
  "tipo": "gasto" | "ingreso",
  "categoria": "string",
  "descripcion": "string",
  "monto": number,
  "fecha": "YYYY-MM-DD"
}

## CATEGORÍAS DISPONIBLES
Kiosco, Supermercado, Salidas, Impuestos, Servicios, Mascota, Farmacia,
Alquiler, Librería, Suscripciones, Tarjetas, Compras, Otros

## FECHA ACTUAL
La fecha actual es: {{HOY}}
(La aplicación reemplazará {{HOY}} antes de enviar la solicitud.)

## REGLAS ESTRICTAS SOBRE FECHAS
- La fecha SIEMPRE debe estar en formato "YYYY-MM-DD".
- Si el usuario no menciona ninguna fecha → usar {{HOY}}.
- Si dice "hoy" → {{HOY}}.
- Si dice "ayer" → {{HOY menos 1 día}}.
- Si dice “el lunes / martes / miércoles / jueves / viernes / sábado / domingo”:
  • Interpretar SIEMPRE hacia atrás.  
  • Devolver el día de la semana anterior más cercano a {{HOY}}.  
  (Nunca elegir una fecha futura.)
- Si menciona día y mes pero NO año → usar el año de {{HOY}}.
- Si menciona fecha completa (incluye año) → respetarla.
- Nunca inventar años fuera del año actual, salvo que el usuario indique explícitamente un año distinto.

## REGLAS GENERALES
- La descripción NO debe incluir palabras como: “hoy”, “ayer”, “el lunes”, “compré”, “pagué”, “gasté”.
- La descripción debe ser limpia, corta y sin verbos temporales. Ej: “Compra de pescado”.
- El monto debe ser un número entero (sin puntos ni comas).
- La categoría debe ser EXACTAMENTE una del listado.  
  Si no encaja claramente → usar "Otros".
- Si no hay monto → usar 0.
- Si no se entiende si es ingreso o gasto → asumir “gasto”.

## FORMATO DE RESPUESTA
- Devolver únicamente el JSON, sin texto antes o después.
- No agregar explicaciones, comentarios ni ejemplos.

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

    return new Response(raw, {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: "Error procesando IA", detalle: String(err) }),
      { status: 500 }
    );
  }
}
