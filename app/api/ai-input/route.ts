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
(La aplicación reemplaza {{HOY}} antes de enviar esta instrucción.)

## REGLAS ESTRICTAS SOBRE FECHAS

- La fecha SIEMPRE debe estar en formato "YYYY-MM-DD".
- Si el usuario no menciona fecha → usar {{HOY}}.
- “hoy” → {{HOY}}
- “ayer” → {{HOY menos 1 día}}

- Si dice “el lunes / martes / miércoles / jueves / viernes / sábado / domingo”:
  • Interpretar SIEMPRE hacia atrás.  
  • Tomar el día de la semana anterior más cercano.  
  • **Pero JAMÁS cruzar al año anterior.**  
    Si el cálculo normal cae en diciembre del año pasado, ajustar al **primer día de esa semana dentro del año actual**.

  Ejemplo:  
  Si {{HOY}} es 2025-01-03 y el usuario dice “el jueves”:  
  El jueves anterior sería 2024-12-26 → NO PERMITIDO.  
  La fecha correcta debe quedarse en 2025, ajustándose como: 2025-01-02.

- Si menciona día y mes pero NO año → usar SIEMPRE el año de {{HOY}}.
- Si menciona fecha completa (incluye año) → respetarla.
- Nunca inventar años. Nunca usar un año distinto salvo que el usuario lo escriba explícitamente.
- Nunca devolver una fecha del año anterior salvo que el usuario diga el año.

## REGLAS GENERALES
- La descripción NO debe incluir "hoy", "ayer", “el lunes”, “compré”, “pagué”, “gasté”, etc.
- La descripción debe ser corta, limpia y sin verbos temporales.
- El monto debe ser un número entero sin separadores.
- La categoría debe ser EXACTAMENTE una del listado.  
  Si no encaja claramente → "Otros".
- Si no se menciona monto → usar 0.
- Si no se entiende si es ingreso o gasto → asumir “gasto”.

## FORMATO DE RESPUESTA
- Devolver únicamente el JSON, sin texto extra.
- No agregar explicaciones ni ejemplos.

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
