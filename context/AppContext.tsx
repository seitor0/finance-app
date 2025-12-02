"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";

// -----------------------------------
// TIPOS
// -----------------------------------
export type PaymentStatus = "pagado" | "falta" | "pospuesto";

export interface ToPayItem {
  id: string;
  nombre: string;
  categoria?: string;
  monto: number;
  vencimiento?: string; // YYYY-MM-DD
  status: PaymentStatus;
  importante?: boolean;
}

export interface Movimiento {
  id: string;
  descripcion: string;
  monto: number;
  fecha: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  telefono?: string;
  email?: string;
}

interface AppContextType {
  ingresos: Movimiento[];
  gastos: Movimiento[];
  clientes: Cliente[];
  cosasPorPagar: ToPayItem[];
  loadingData: boolean;

  // Acciones: COSAS POR PAGAR
  agregarCosaPorPagar: (item: Omit<ToPayItem, "id">) => Promise<void>;
  cambiarEstadoPago: (id: string, nuevoEstado: PaymentStatus) => Promise<void>;

  // Acciones: CLIENTES
  agregarCliente: (data: Omit<Cliente, "id">) => Promise<void>;
  editarCliente: (id: string, data: Partial<Cliente>) => Promise<void>;
  borrarCliente: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

// -----------------------------------
// PROVIDER
// -----------------------------------
export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [ingresos, setIngresos] = useState<Movimiento[]>([]);
  const [gastos, setGastos] = useState<Movimiento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cosasPorPagar, setCosasPorPagar] = useState<ToPayItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) {
      setIngresos([]);
      setGastos([]);
      setClientes([]);
      setCosasPorPagar([]);
      setLoadingData(false);
      return;
    }

    const uid = user.uid;

    // Ingresos
    const qIngresos = query(
      collection(db, "usuarios", uid, "ingresos"),
      orderBy("fecha", "desc")
    );
    const unsubIngresos = onSnapshot(qIngresos, (snapshot) => {
      setIngresos(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Movimiento[]
      );
    });

    // Gastos
    const qGastos = query(
      collection(db, "usuarios", uid, "gastos"),
      orderBy("fecha", "desc")
    );
    const unsubGastos = onSnapshot(qGastos, (snapshot) => {
      setGastos(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Movimiento[]
      );
    });

    // Clientes
    const qClientes = collection(db, "usuarios", uid, "clientes");
    const unsubClientes = onSnapshot(qClientes, (snapshot) => {
      setClientes(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Cliente[]
      );
    });

    // Cosas por pagar
    const qPagar = collection(db, "usuarios", uid, "cosasPorPagar");
    const unsubPagar = onSnapshot(qPagar, (snapshot) => {
      setCosasPorPagar(
        snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ToPayItem[]
      );
    });

    setLoadingData(false);

    return () => {
      unsubIngresos();
      unsubGastos();
      unsubClientes();
      unsubPagar();
    };
  }, [user]);

  // -------------------------------------
  // COSAS POR PAGAR
  // -------------------------------------
  async function agregarCosaPorPagar(item: Omit<ToPayItem, "id">) {
    if (!user) return;

    await addDoc(
      collection(db, "usuarios", user.uid, "cosasPorPagar"),
      item
    );
  }

  async function cambiarEstadoPago(id: string, nuevoEstado: PaymentStatus) {
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid, "cosasPorPagar", id);

    if (nuevoEstado === "pagado") {
      const item = cosasPorPagar.find((i) => i.id === id);
      if (item) {
        await addDoc(collection(db, "usuarios", user.uid, "gastos"), {
          descripcion: item.nombre,
          monto: item.monto,
          fecha: new Date().toISOString().split("T")[0],
        });
      }
    }

    await updateDoc(ref, { status: nuevoEstado });
  }

  // -------------------------------------
  // CLIENTES
  // -------------------------------------
  async function agregarCliente(data: Omit<Cliente, "id">) {
    if (!user) return;

    await addDoc(collection(db, "usuarios", user.uid, "clientes"), data);
  }

  async function editarCliente(id: string, data: Partial<Cliente>) {
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid, "clientes", id);
    await updateDoc(ref, data);
  }

  async function borrarCliente(id: string) {
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid, "clientes", id);
    await deleteDoc(ref);
  }

  return (
    <AppContext.Provider
      value={{
        ingresos,
        gastos,
        clientes,
        cosasPorPagar,
        loadingData,
        agregarCosaPorPagar,
        cambiarEstadoPago,
        agregarCliente,
        editarCliente,
        borrarCliente,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de AppProvider");
  return ctx;
}
