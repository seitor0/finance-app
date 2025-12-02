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
  categoria?: string;
}

export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  notas?: string;
}

export interface Ahorro {
  id: string;
  usd: number;
  fecha: string;
  notas?: string;
}

interface AppContextType {
  ingresos: Movimiento[];
  gastos: Movimiento[];
  clientes: Cliente[];
  cosasPorPagar: ToPayItem[];
  ahorros: Ahorro[];
  dineroDisponible: number;
  setDineroDisponible: (v: number) => void;
  loadingData: boolean;

  agregarCosaPorPagar: (item: Omit<ToPayItem, "id">) => Promise<void>;
  cambiarEstadoPago: (id: string, nuevoEstado: PaymentStatus) => Promise<void>;

  agregarCliente: (data: Omit<Cliente, "id">) => Promise<void>;
  editarCliente: (id: string, data: Partial<Cliente>) => Promise<void>;
  borrarCliente: (id: string) => Promise<void>;

  agregarIngreso: (data: Omit<Movimiento, "id">) => Promise<void>;
  editarIngreso: (id: string, data: Partial<Movimiento>) => Promise<void>;
  borrarIngreso: (id: string) => Promise<void>;

  agregarGasto: (data: Omit<Movimiento, "id">) => Promise<void>;
  editarGasto: (id: string, data: Partial<Movimiento>) => Promise<void>;
  borrarGasto: (id: string) => Promise<void>;

  agregarAhorro: (data: Omit<Ahorro, "id">) => Promise<void>;
  editarAhorro: (id: string, data: Partial<Ahorro>) => Promise<void>;
  borrarAhorro: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

// -----------------------------------
// PROVIDER
// -----------------------------------

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, loadingUser } = useAuth();

  const [ingresos, setIngresos] = useState<Movimiento[]>([]);
  const [gastos, setGastos] = useState<Movimiento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cosasPorPagar, setCosasPorPagar] = useState<ToPayItem[]>([]);
  const [ahorros, setAhorros] = useState<Ahorro[]>([]);
  const [dineroDisponible, setDineroDisponible] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  // 🔥 Esperar a Firebase Auth
  useEffect(() => {
    if (loadingUser) return;

    if (!user) {
      setIngresos([]);
      setGastos([]);
      setClientes([]);
      setCosasPorPagar([]);
      setAhorros([]);
      setLoadingData(false);
      return;
    }

    const uid = user.uid;
    setLoadingData(true);

    // -------------------------------------
    // SUSCRIPCIONES A FIRESTORE
    // -------------------------------------

    const unsubIngresos = onSnapshot(
      query(collection(db, "usuarios", uid, "ingresos"), orderBy("fecha", "desc")),
      snapshot => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Movimiento[];
        setIngresos(data);
      }
    );

    const unsubGastos = onSnapshot(
      query(collection(db, "usuarios", uid, "gastos"), orderBy("fecha", "desc")),
      snapshot => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Movimiento[];
        setGastos(data);
      }
    );

    const unsubClientes = onSnapshot(
      collection(db, "usuarios", uid, "clientes"),
      snapshot => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Cliente[];
        setClientes(data);
      }
    );

    const unsubPagar = onSnapshot(
      collection(db, "usuarios", uid, "cosasPorPagar"),
      snapshot => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as ToPayItem[];
        setCosasPorPagar(data);
      }
    );

    const unsubAhorros = onSnapshot(
      collection(db, "usuarios", uid, "ahorros"),
      snapshot => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Ahorro[];
        setAhorros(data);
      }
    );

    setLoadingData(false);

    return () => {
      unsubIngresos();
      unsubGastos();
      unsubClientes();
      unsubPagar();
      unsubAhorros();
    };
  }, [user, loadingUser]);

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
    const item = cosasPorPagar.find((i) => i.id === id);

    // Si se paga → guardar como gasto
    if (nuevoEstado === "pagado" && item) {
      await addDoc(collection(db, "usuarios", user.uid, "gastos"), {
        descripcion: item.nombre,
        monto: item.monto,
        categoria: item.categoria ?? "General",
        fecha: new Date().toISOString().split("T")[0],
      });
    }

    await updateDoc(ref, { status: nuevoEstado });
  }

  // -------------------------------------
  // AHORROS
  // -------------------------------------

  async function agregarAhorro(data: Omit<Ahorro, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "ahorros"), data);
  }

  async function editarAhorro(id: string, data: Partial<Ahorro>) {
    if (!user) return;
    await updateDoc(doc(db, "usuarios", user.uid, "ahorros", id), data);
  }

  async function borrarAhorro(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "ahorros", id));
  }

  return (
    <AppContext.Provider
      value={{
        ingresos,
        gastos,
        clientes,
        cosasPorPagar,
        ahorros,
        dineroDisponible,
        setDineroDisponible,
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

        agregarAhorro,
        editarAhorro,
        borrarAhorro,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("❌ useApp debe usarse dentro de <AppProvider>");
  return ctx;
}
