
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { texto } = await req.json();

    console.log("📩 Texto recibido:", texto);

    const prompt = `
Interpretá un gasto/ingreso financiero y devolvé SOLO JSON válido con:

{
  "tipo": "gasto" | "ingreso",
  "categoria": "string",
  "descripcion": "string",
  "monto": number,
  "fecha": "YYYY-MM-DD"
}

### CATEGORÍAS OFICIALES (elegir una EXACTA):
- Kiosco
- Supermercado
- Salidas
- Impuestos
- Servicios
- Mascota
- Farmacia
- Alquiler   (incluye alquiler, expensas, cochera)
- Librería
- Suscripciones
- Tarjetas   (todas las tarjetas de crédito)
- Compras    (incluye ropa, juguetes, tecnología)
- Otros

### MAPA DE PALABRAS CLAVE PARA CLASIFICAR:

Kiosco → kiosco, cigarrillos, puchos, golosinas, snacks  
Supermercado → super, supermercado, chino, comida, alimentos, limpieza  
Salidas → restaurante, cena, almuerzo afuera, salir a comer, bar, café  
Impuestos → AFIP, ingresos brutos, IVA, patente, municipal  
Servicios → gas, luz, agua, internet, cable, celular  
Mascota → perro, Chispa, veterinaria, paseador, alimento de mascota  
Farmacia → remedio, medicamentos, farmacia  
Alquiler → alquiler, expensas, cochera  
Librería → librería, útiles, cuadernos  
Suscripciones → Netflix, Spotify, membresía, suscripción  
Tarjetas → pago tarjeta, Mastercard, Visa, Naranja, Amex  
Compras → ropa, juguetes, tecnología, indumentaria, celular, notebook  

### DESCRIPCIÓN:
Debe ser limpia y sin palabras como “hoy”, “ayer”, “pagué”, “gasté”.

Ejemplos:
- "Hoy pagué el servicio de gas 89000" → "Pago de gas"
- "Compré juguetes para las chicas" → "Compra de juguetes"

### MONTO:
Debe parsearse aunque tenga puntos, comas o texto alrededor.

### FECHA:
- “hoy” → fecha actual
- “ayer” → fecha actual - 1 día
- “el lunes/martes/etc” → calcular el último día mencionado
- “12 de noviembre” → convertir a YYYY-MM-DD
- Si no hay fecha → usar fecha actual
{
  "tipo": "...",
  "descripcion": "...",
  "categoria": "...",
  "monto": ...,
  "usd": ...,
  "fecha": "YYYY-MM-DD"
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

    console.log("🧠 RAW RESPONSE:", chat);

    const content = chat.choices?.[0]?.message?.content?.trim();

    console.log("🧠 IA content:", content);

    if (!content) {
      throw new Error("La IA no devolvió contenido");
    }

    return new Response(content, {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("🔥 ERROR IA:", err);

    return new Response(
      JSON.stringify({ error: "Error procesando IA", detalle: String(err) }),
      { status: 500 }
    );
  }
}
