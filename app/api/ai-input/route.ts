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
