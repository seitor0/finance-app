// app/api/ai-input/route.ts
import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { saveFromAI } from "@/lib/saveFromAI";

export async function POST(req: Request) {
  try {
    const { texto } = await req.json();

    if (!texto) {
      return NextResponse.json({
        error: true,
        message: "Falta texto",
      });
    }

    const client = new Groq({
      apiKey: process.env.GROQ_API_KEY!,
    });

    const prompt = `
Interpretá este mensaje y devolveme SOLO un JSON válido.

- Si detectás un gasto:
  {
    "tipo": "Gasto",
    "descripcion": "...",
    "monto": 1234,
    "categoria": "..."
  }

- Si detectás un ingreso:
  {
    "tipo": "Ingreso",
    "descripcion": "...",
    "monto": 1234
  }

NO agregues explicación, solo JSON limpio.
Mensaje recibido:
"${texto}"
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "Respondé estrictamente en JSON válido." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    let raw = completion.choices[0]?.message?.content || "";

    // limpieza de bloques ```json
    let cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    // intentar parsear
    let data;
    try {
      data = JSON.parse(cleaned);

      // Normalizar tipo (FIX CRÍTICO)
      if (data.tipo) {
        const t = data.tipo.toString().trim().toLowerCase();

        if (t === "gasto") data.tipo = "Gasto";
        if (t === "ingreso") data.tipo = "Ingreso";
      }

      // Validación mínima
      if (!["Gasto", "Ingreso"].includes(data.tipo)) {
        return NextResponse.json({
          error: true,
          message: "Tipo inválido",
          data,
        });
      }

      // validación del monto
      if (typeof data.monto !== "number" || isNaN(data.monto)) {
        return NextResponse.json({
          error: true,
          message: "Monto inválido",
          data,
        });
      }

    } catch (e) {
      return NextResponse.json({
        error: true,
        message: "JSON inválido",
        raw,
        cleaned,
      });
    }

    // Guardar en Firestore
    const saved = await saveFromAI(data);

    return NextResponse.json({
      ok: true,
      data,
      saved,
      raw,
    });

  } catch (e: any) {
    return NextResponse.json({
      error: true,
      message: "Error en servidor",
      detail: e.message,
    });
  }
}
