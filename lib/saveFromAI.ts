import { addDoc, collection } from "firebase/firestore";

import { auth, db } from "./firebase";

type AIData = {
  tipo: "Gasto" | "Ingreso";
  descripcion?: string;
  monto: number;
  categoria?: string;
};

export async function saveFromAI(data: AIData) {
  const user = auth.currentUser;
  if (!user) return { ok: false, error: "No autenticado" };

  const uid = user.uid;

  try {
    if (data.tipo === "Gasto") {
      const docRef = await addDoc(
        collection(db, "usuarios", uid, "gastos"),
        {
          descripcion: data.descripcion || "",
          monto: data.monto,
          categoria: data.categoria || "Otros",
          fecha: new Date().toISOString(),
        }
      );
      return { ok: true, id: docRef.id };
    }

    if (data.tipo === "Ingreso") {
      const docRef = await addDoc(
        collection(db, "usuarios", uid, "ingresos"),
        {
          descripcion: data.descripcion || "",
          monto: data.monto,
          fecha: new Date().toISOString(),
        }
      );
      return { ok: true, id: docRef.id };
    }

    return { ok: false, error: "Tipo no reconocido" };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Error desconocido";
    return { ok: false, error: errorMessage };
  }
}
