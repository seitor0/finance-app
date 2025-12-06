import { db } from "@/lib/firebase";
import { addDoc, collection } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { uid, descripcion, monto, tipo } = await req.json();

    if (!uid || !descripcion || typeof monto !== "number" || !tipo) {
      return new Response(JSON.stringify({ error: "Datos incompletos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (tipo !== "Ingreso" && tipo !== "Gasto") {
      return new Response(JSON.stringify({ error: "Tipo inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const fecha = new Date().toISOString().slice(0, 10);

    await addDoc(
      collection(db, "usuarios", uid, tipo === "Ingreso" ? "ingresos" : "gastos"),
      {
        descripcion,
        monto,
        fecha,
        tipo,
      }
    );

    return new Response(
      JSON.stringify({ ok: true, message: "Movimiento agregado correctamente" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
