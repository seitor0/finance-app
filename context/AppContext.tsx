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
  cosasPorPagar: ToPayItem[];
  clientes: Cliente[];
  ahorros: Ahorro[];

  // Disponible: ingresos – gastos
  dineroDisponible: number;

  // Balance real: ingresos – gastos – pendientes (solo "falta")
  balanceReal: number;

  loadingData: boolean;

  agregarIngreso: (d: Omit<Movimiento, "id">) => Promise<void>;
  editarIngreso: (id: string, d: Partial<Movimiento>) => Promise<void>;
  borrarIngreso: (id: string) => Promise<void>;

  agregarGasto: (d: Omit<Movimiento, "id">) => Promise<void>;
  editarGasto: (id: string, d: Partial<Movimiento>) => Promise<void>;
  borrarGasto: (id: string) => Promise<void>;

  agregarCosaPorPagar: (d: Omit<ToPayItem, "id">) => Promise<void>;
  cambiarEstadoPago: (id: string, estado: PaymentStatus) => Promise<void>;

  agregarCliente: (d: Omit<Cliente, "id">) => Promise<void>;
  editarCliente: (id: string, d: Partial<Cliente>) => Promise<void>;
  borrarCliente: (id: string) => Promise<void>;

  agregarAhorro: (d: Omit<Ahorro, "id">) => Promise<void>;
  editarAhorro: (id: string, d: Partial<Ahorro>) => Promise<void>;
  borrarAhorro: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

// Helper para evitar concatenaciones tipo "0100200"
function toNumber(value: any): number {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

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
  const [balanceReal, setBalanceReal] = useState(0);

  const [loadingData, setLoadingData] = useState(true);

  // ---------- FIREBASE SUBSCRIPTIONS ----------
  useEffect(() => {
    if (loadingUser) return;

    if (!user) {
      setIngresos([]);
      setGastos([]);
      setClientes([]);
      setCosasPorPagar([]);
      setAhorros([]);
      setDineroDisponible(0);
      setBalanceReal(0);
      setLoadingData(false);
      return;
    }

    const uid = user.uid;
    setLoadingData(true);

    const unsubIngresos = onSnapshot(
      query(
        collection(db, "usuarios", uid, "ingresos"),
        orderBy("fecha", "desc")
      ),
      (snap) =>
        setIngresos(
          snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Movimiento[]
        )
    );

    const unsubGastos = onSnapshot(
      query(
        collection(db, "usuarios", uid, "gastos"),
        orderBy("fecha", "desc")
      ),
      (snap) =>
        setGastos(
          snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Movimiento[]
        )
    );

    const unsubClientes = onSnapshot(
      collection(db, "usuarios", uid, "clientes"),
      (snap) =>
        setClientes(
          snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Cliente[]
        )
    );

    const unsubPagar = onSnapshot(
      collection(db, "usuarios", uid, "cosasPorPagar"),
      (snap) =>
        setCosasPorPagar(
          snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ToPayItem[]
        )
    );

    const unsubAhorros = onSnapshot(
      collection(db, "usuarios", uid, "ahorros"),
      (snap) =>
        setAhorros(
          snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Ahorro[]
        )
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

  // ---------- CÁLCULOS GLOBALES ----------
  useEffect(() => {
    const totalIngresos = ingresos.reduce(
      (a, i) => a + toNumber(i.monto),
      0
    );

    const totalGastos = gastos.reduce(
      (a, g) => a + toNumber(g.monto),
      0
    );

    const totalPendientes = cosasPorPagar
      .filter((c) => c.status === "falta")
      .reduce((a, c) => a + toNumber(c.monto), 0);

    // Disponible HOY: ingresos – gastos
    setDineroDisponible(totalIngresos - totalGastos);

    // Balance real: ingresos – gastos – pendientes (solo "falta")
    setBalanceReal(totalIngresos - totalGastos - totalPendientes);
  }, [ingresos, gastos, cosasPorPagar]);

  // ---------- CRUD ----------

  // INGRESOS
  async function agregarIngreso(data: Omit<Movimiento, "id">) {
    if (!user) return;

    const payload: Omit<Movimiento, "id"> = {
      ...data,
      monto: toNumber((data as any).monto),
    };

    await addDoc(collection(db, "usuarios", user.uid, "ingresos"), payload);
  }

  async function editarIngreso(id: string, d: Partial<Movimiento>) {
    if (!user) return;

    const payload: Partial<Movimiento> = {
      ...d,
      ...(d.monto !== undefined ? { monto: toNumber(d.monto) } : {}),
    };

    await updateDoc(
      doc(db, "usuarios", user.uid, "ingresos", id),
      payload
    );
  }

  async function borrarIngreso(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "ingresos", id));
  }

  // GASTOS
  async function agregarGasto(data: Omit<Movimiento, "id">) {
    if (!user) return;

    const payload: Omit<Movimiento, "id"> = {
      ...data,
      monto: toNumber((data as any).monto),
    };

    await addDoc(collection(db, "usuarios", user.uid, "gastos"), payload);
  }

  async function editarGasto(id: string, d: Partial<Movimiento>) {
    if (!user) return;

    const payload: Partial<Movimiento> = {
      ...d,
      ...(d.monto !== undefined ? { monto: toNumber(d.monto) } : {}),
    };

    await updateDoc(
      doc(db, "usuarios", user.uid, "gastos", id),
      payload
    );
  }

  async function borrarGasto(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "gastos", id));
  }

  // COSAS POR PAGAR
  async function agregarCosaPorPagar(data: Omit<ToPayItem, "id">) {
    if (!user) return;

    const payload: Omit<ToPayItem, "id"> = {
      ...data,
      monto: toNumber((data as any).monto),
    };

    await addDoc(
      collection(db, "usuarios", user.uid, "cosasPorPagar"),
      payload
    );
  }

  async function cambiarEstadoPago(id: string, estado: PaymentStatus) {
    if (!user) return;

    const item = cosasPorPagar.find((c) => c.id === id);
    const ref = doc(db, "usuarios", user.uid, "cosasPorPagar", id);

    // Si pasa a "pagado" lo guardamos como gasto real
    if (estado === "pagado" && item) {
      await addDoc(collection(db, "usuarios", user.uid, "gastos"), {
        descripcion: item.nombre,
        monto: toNumber(item.monto),
        categoria: item.categoria ?? "Otros",
        fecha: new Date().toISOString().split("T")[0],
      });
    }

    await updateDoc(ref, { status: estado });
  }

  // CLIENTES
  async function agregarCliente(data: Omit<Cliente, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "clientes"), data);
  }

  async function editarCliente(id: string, d: Partial<Cliente>) {
    if (!user) return;
    await updateDoc(
      doc(db, "usuarios", user.uid, "clientes", id),
      d
    );
  }

  async function borrarCliente(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "clientes", id));
  }

  // AHORROS
  async function agregarAhorro(data: Omit<Ahorro, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "ahorros"), data);
  }

  async function editarAhorro(id: string, d: Partial<Ahorro>) {
    if (!user) return;
    await updateDoc(
      doc(db, "usuarios", user.uid, "ahorros", id),
      d
    );
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
        balanceReal,

        loadingData,

        agregarIngreso,
        editarIngreso,
        borrarIngreso,

        agregarGasto,
        editarGasto,
        borrarGasto,

        agregarCosaPorPagar,
        cambiarEstadoPago,

        agregarCliente,
        editarCliente,
        borrarCliente,

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
  if (!ctx) throw new Error(" useApp debe ir dentro de <AppProvider>");
  return ctx;
}
