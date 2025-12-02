import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    groqKeyPresent: !!process.env.GROQ_API_KEY,
    groqKeyStart: process.env.GROQ_API_KEY?.slice(0, 10) || null
  });
}
