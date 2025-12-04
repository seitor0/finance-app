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

---

# 🚨 MANEJO DE FECHAS (MUY IMPORTANTE)

Debés convertir **siempre** cualquier referencia temporal a una fecha real:

### REFERENCIAS RELATIVAS
- "hoy" → fecha de hoy
- "ayer" → fecha de ayer
- "anteayer" → dos días atrás

### DÍAS DE LA SEMANA  
"el lunes", "el martes", "el miércoles", "el jueves",  
"el viernes", "el sábado", "el domingo"  
→ SIEMPRE significa **el último día que ya pasó**, nunca uno futuro.

Ejemplo: si hoy es jueves 20, "el lunes" = lunes 17.

### SIN REFERENCIA EXPLÍCITA
Si el mensaje NO menciona ninguna fecha → usar fecha de HOY.

### PROHIBIDO
🚫 NO podés devolver "YYYY-MM-DD" literal  
🚫 NO podés devolver una fecha inválida  
🚫 Siempre debe ser una fecha real del año actual

---

# REGLAS PARA EL RESTO
- La descripción NO debe incluir palabras como “hoy”, “ayer”, “el lunes”, “pagué”, “gasté”.
- El monto debe ser un número entero sin puntos ni comas.
- La categoría debe ser EXACTA del listado (si no encaja → "Otros").

---

# EJEMPLOS

"ayer compré alfajores en el kiosco gasté 10200" →
{
  "tipo": "gasto",
  "categoria": "Kiosco",
  "descripcion": "Compra de alfajores",
  "monto": 10200,
  "fecha": "<fecha de ayer>"
}

"el domingo pagué 50000 al contador" →
{
  "tipo": "gasto",
  "categoria": "Servicios",
  "descripcion": "Pago contador",
  "monto": 50000,
  "fecha": "<último domingo>"
}

"compré un libro 12000" →
{
  "tipo": "gasto",
  "categoria": "Librería",
  "descripcion": "Compra de libro",
  "monto": 12000,
  "fecha": "<hoy>"
}
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
