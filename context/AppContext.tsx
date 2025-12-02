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
  vencimiento?: string;
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
  email: string;
  telefono: string;
  notas?: string;
}

interface AppContextType {
  ingresos: Movimiento[];
  gastos: Movimiento[];
  clientes: Cliente[];
  cosasPorPagar: ToPayItem[];
  loadingData: boolean;

  // COSAS POR PAGAR
  agregarCosaPorPagar: (item: Omit<ToPayItem, "id">) => Promise<void>;
  cambiarEstadoPago: (id: string, nuevoEstado: PaymentStatus) => Promise<void>;

  // CLIENTES
  agregarCliente: (data: Omit<Cliente, "id">) => Promise<void>;
  editarCliente: (id: string, data: Partial<Cliente>) => Promise<void>;
  borrarCliente: (id: string) => Promise<void>;

  // INGRESOS
  agregarIngreso: (data: Omit<Movimiento, "id">) => Promise<void>;
  editarIngreso: (id: string, data: Partial<Movimiento>) => Promise<void>;
  borrarIngreso: (id: string) => Promise<void>;

  // GASTOS
  agregarGasto: (data: Omit<Movimiento, "id">) => Promise<void>;
  editarGasto: (id: string, data: Partial<Movimiento>) => Promise<void>;
  borrarGasto: (id: string) => Promise<void>;
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

    // -------------------------------------
    // SUSCRIPCIONES
    // -------------------------------------
    const unsubIngresos = onSnapshot(
      query(collection(db, "usuarios", uid, "ingresos"), orderBy("fecha", "desc")),
      snapshot => setIngresos(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Movimiento[])
    );

    const unsubGastos = onSnapshot(
      query(collection(db, "usuarios", uid, "gastos"), orderBy("fecha", "desc")),
      snapshot => setGastos(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Movimiento[])
    );

    const unsubClientes = onSnapshot(
      collection(db, "usuarios", uid, "clientes"),
      snapshot => setClientes(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Cliente[])
    );

    const unsubPagar = onSnapshot(
      collection(db, "usuarios", uid, "cosasPorPagar"),
      snapshot => setCosasPorPagar(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as ToPayItem[])
    );

    setLoadingData(false);

    return () => {
      unsubIngresos();
      unsubGastos();
      unsubClientes();
      unsubPagar();
    };
  }, [user]);

  // -------------------------------------
  // INGRESOS
  // -------------------------------------

  async function agregarIngreso(data: Omit<Movimiento, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "ingresos"), data);
  }

  async function editarIngreso(id: string, data: Partial<Movimiento>) {
    if (!user) return;
    await updateDoc(doc(db, "usuarios", user.uid, "ingresos", id), data);
  }

  async function borrarIngreso(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "ingresos", id));
  }

  // -------------------------------------
  // GASTOS
  // -------------------------------------

  async function agregarGasto(data: Omit<Movimiento, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "gastos"), data);
  }

  async function editarGasto(id: string, data: Partial<Movimiento>) {
    if (!user) return;
    await updateDoc(doc(db, "usuarios", user.uid, "gastos", id), data);
  }

  async function borrarGasto(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "gastos", id));
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
    await updateDoc(doc(db, "usuarios", user.uid, "clientes", id), data);
  }

  async function borrarCliente(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "clientes", id));
  }

  // -------------------------------------
  // COSAS POR PAGAR
  // -------------------------------------

  async function agregarCosaPorPagar(item: Omit<ToPayItem, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "cosasPorPagar"), item);
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

        agregarIngreso,
        editarIngreso,
        borrarIngreso,

        agregarGasto,
        editarGasto,
        borrarGasto,
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
