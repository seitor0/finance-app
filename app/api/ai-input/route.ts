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
Interpretá el mensaje y devolvé SOLO este JSON válido:

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

### REGLAS IMPORTANTES SOBRE FECHAS
- La fecha SIEMPRE debe estar en formato "YYYY-MM-DD".
- Si el usuario no menciona fecha → usar la fecha de HOY.
- Si dice "hoy" → usar la fecha de hoy.
- Si dice "ayer" → usar la fecha de ayer.
- Si dice “el lunes / martes / miércoles / etc.” → devolver la fecha del día de la semana anterior más reciente.
- Si el usuario menciona día y mes pero NO año → usar el año actual.
- Si menciona fecha completa → respetarla.
- NO inventar años fuera de rango (solo usar el año actual salvo que el usuario especifique un año distinto).

### REGLAS GENERALES
- La descripción NO debe incluir palabras como “hoy”, “ayer”, “el lunes”, “pagué”, “gasté”.
- El monto debe ser un número entero (sin puntos ni comas como separadores).
- La categoría debe ser EXACTAMENTE una del listado.
- Si no encaja en ninguna categoría claramente, usar "Otros".

### EJEMPLOS
"Hoy pagué gas 89000"
→ {"tipo":"gasto","categoria":"Servicios","descripcion":"Pago de gas","monto":89000,"fecha":"2025-02-14"}

"Compré juguetes"
→ {"tipo":"gasto","categoria":"Compras","descripcion":"Compra de juguetes","monto":0,"fecha":"2025-02-14"}

"Ayer gasté 10200 en el kiosco comprando alfajores"
→ {"tipo":"gasto","categoria":"Kiosco","descripcion":"Compra de alfajores","monto":10200,"fecha":"2025-02-13"}

"El lunes pagué 50000 al contador por honorarios"
→ {"tipo":"gasto","categoria":"Servicios","descripcion":"Pago honorarios contador","monto":50000,"fecha":"2025-02-10"}
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
