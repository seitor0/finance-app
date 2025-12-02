// app/api/ai-input/route.ts
import { NextResponse } from "next/server";
import { parseFinanceText } from "./schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const textoCrudo = (body?.texto ?? "").toString().trim();

    if (!textoCrudo) {
      return NextResponse.json(
        { error: "Falta el campo 'texto'" },
        { status: 400 }
      );
    }

    const result = parseFinanceText(textoCrudo);
    return NextResponse.json(result);
  } catch (e) {
    console.error("Error en /api/ai-input:", e);
    return NextResponse.json(
      { error: "Error procesando el texto" },
      { status: 500 }
    );
  }
}
