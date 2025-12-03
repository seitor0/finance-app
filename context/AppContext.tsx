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
  getDoc,
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

// ----- NUEVO: COSAS POR COBRAR -----
export type CobroStatus = "terminado" | "facturado" | "cobrado";

export interface ToCollectItem {
  id: string;
  nombre: string;
  categoria?: string;
  monto: number;
  vencimiento?: string;
  status: CobroStatus;
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
  cosasPorCobrar: ToCollectItem[];   // 👈 nuevo
  clientes: Cliente[];
  ahorros: Ahorro[];

  dineroDisponible: number;
  balanceReal: number;
  loadingData: boolean;

  agregarIngreso: (d: Omit<Movimiento, "id">) => Promise<void>;
  editarIngreso: (id: string, d: Partial<Movimiento>) => Promise<void>;
  borrarIngreso: (id: string) => Promise<void>;

  agregarGasto: (d: Omit<Movimiento, "id">) => Promise<void>;
  editarGasto: (id: string, d: Partial<Movimiento>) => Promise<void>;
  borrarGasto: (id: string) => Promise<void>;

  agregarCosaPorPagar: (d: Omit<ToPayItem, "id">) => Promise<void>;
  editarCosaPorPagar: (id: string, d: Partial<ToPayItem>) => Promise<void>;
  cambiarEstadoPago: (id: string, estado: PaymentStatus) => Promise<void>;

  // NUEVOS CRUD COBROS
  agregarCosaPorCobrar: (d: Omit<ToCollectItem, "id">) => Promise<void>;
  editarCosaPorCobrar: (id: string, d: Partial<ToCollectItem>) => Promise<void>;
  borrarCosaPorCobrar: (id: string) => Promise<void>;
  marcarCobroComoCobrado: (item: ToCollectItem) => Promise<void>;

  agregarCliente: (d: Omit<Cliente, "id">) => Promise<void>;
  editarCliente: (id: string, d: Partial<Cliente>) => Promise<void>;
  borrarCliente: (id: string) => Promise<void>;

  agregarAhorro: (d: Omit<Ahorro, "id">) => Promise<void>;
  editarAhorro: (id: string, d: Partial<Ahorro>) => Promise<void>;
  borrarAhorro: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

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
  const [cosasPorCobrar, setCosasPorCobrar] = useState<ToCollectItem[]>([]); // 👈 nuevo
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
      setCosasPorCobrar([]);
      setAhorros([]);
      setDineroDisponible(0);
      setBalanceReal(0);
      setLoadingData(false);
      return;
    }

    const uid = user.uid;
    setLoadingData(true);

    const unsubIngresos = onSnapshot(
      query(collection(db, "usuarios", uid, "ingresos"), orderBy("fecha", "desc")),
      (snap) => setIngresos(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Movimiento[])
    );

    const unsubGastos = onSnapshot(
      query(collection(db, "usuarios", uid, "gastos"), orderBy("fecha", "desc")),
      (snap) => setGastos(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Movimiento[])
    );

    const unsubClientes = onSnapshot(
      collection(db, "usuarios", uid, "clientes"),
      (snap) => setClientes(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Cliente[])
    );

    const unsubPagar = onSnapshot(
      collection(db, "usuarios", uid, "cosasPorPagar"),
      (snap) => setCosasPorPagar(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ToPayItem[])
    );

    const unsubCobrar = onSnapshot(
      collection(db, "usuarios", uid, "cosasPorCobrar"),
      (snap) => setCosasPorCobrar(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as ToCollectItem[])
    );

    const unsubAhorros = onSnapshot(
      collection(db, "usuarios", uid, "ahorros"),
      (snap) => setAhorros(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Ahorro[])
    );

    setLoadingData(false);

    return () => {
      unsubIngresos();
      unsubGastos();
      unsubClientes();
      unsubPagar();
      unsubCobrar();
      unsubAhorros();
    };
  }, [user, loadingUser]);

  // ---------- CÁLCULOS GLOBALES ----------
  useEffect(() => {
    const totalIngresos = ingresos.reduce((a, i) => a + toNumber(i.monto), 0);
    const totalGastos = gastos.reduce((a, g) => a + toNumber(g.monto), 0);

    const totalPendientes = cosasPorPagar
      .filter((c) => c.status === "falta" || c.status === "pospuesto")
      .reduce((a, c) => a + toNumber(c.monto), 0);

    setDineroDisponible(totalIngresos - totalGastos);
    setBalanceReal(totalIngresos - totalGastos - totalPendientes);
  }, [ingresos, gastos, cosasPorPagar]);

  // ---------- CRUD INGRESOS / GASTOS ----------
  async function agregarIngreso(data: Omit<Movimiento, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "ingresos"), {
      ...data,
      monto: toNumber(data.monto),
    });
  }

  async function editarIngreso(id: string, d: Partial<Movimiento>) {
    if (!user) return;
    await updateDoc(doc(db, "usuarios", user.uid, "ingresos", id), d);
  }

  async function borrarIngreso(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "ingresos", id));
  }

  async function agregarGasto(data: Omit<Movimiento, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "gastos"), {
      ...data,
      monto: toNumber(data.monto),
    });
  }

  async function editarGasto(id: string, d: Partial<Movimiento>) {
    if (!user) return;
    await updateDoc(doc(db, "usuarios", user.uid, "gastos", id), d);
  }

  async function borrarGasto(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "gastos", id));
  }

  // ---------- COSAS POR PAGAR ----------
  async function agregarCosaPorPagar(data: Omit<ToPayItem, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "cosasPorPagar"), {
      ...data,
      monto: toNumber(data.monto),
    });
  }

  async function editarCosaPorPagar(id: string, d: Partial<ToPayItem>) {
    if (!user) return;
    const ref = doc(db, "usuarios", user.uid, "cosasPorPagar", id);
    await updateDoc(ref, d);
  }

  async function cambiarEstadoPago(id: string, nuevoEstado: PaymentStatus) {
    if (!user) return;
    const ref = doc(db, "usuarios", user.uid, "cosasPorPagar", id);
    const itemSnap = await getDoc(ref);
    const item = itemSnap.data() as ToPayItem;

    if (!item) return;

    if (nuevoEstado === "pagado") {
      await addDoc(collection(db, "usuarios", user.uid, "gastos"), {
        descripcion: item.nombre,
        categoria: item.categoria || "",
        monto: toNumber(item.monto),
        fecha: new Date().toISOString().split("T")[0],
      });
      await deleteDoc(ref);
    } else {
      await updateDoc(ref, { status: nuevoEstado });
    }
  }

  // ---------- NUEVO: COSAS POR COBRAR ----------
  async function agregarCosaPorCobrar(data: Omit<ToCollectItem, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "cosasPorCobrar"), {
      ...data,
      monto: toNumber(data.monto),
    });
  }

  async function editarCosaPorCobrar(id: string, d: Partial<ToCollectItem>) {
    if (!user) return;
    const ref = doc(db, "usuarios", user.uid, "cosasPorCobrar", id);
    await updateDoc(ref, d);
  }

  async function borrarCosaPorCobrar(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "cosasPorCobrar", id));
  }

  // ----- PASAR A “COBRADO” → CREA INGRESO -----
  async function marcarCobroComoCobrado(item: ToCollectItem) {
    if (!user) return;

    const hoy = new Date().toISOString().slice(0, 10);

    await addDoc(collection(db, "usuarios", user.uid, "ingresos"), {
      descripcion: item.nombre,
      monto: toNumber(item.monto),
      fecha: hoy,
      categoria: "Cobros",
    });

    await deleteDoc(doc(db, "usuarios", user.uid, "cosasPorCobrar", item.id));
  }

  // ---------- CLIENTES ----------
  async function agregarCliente(data: Omit<Cliente, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "clientes"), data);
  }

  async function editarCliente(id: string, d: Partial<Cliente>) {
    if (!user) return;
    await updateDoc(doc(db, "usuarios", user.uid, "clientes", id), d);
  }

  async function borrarCliente(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "clientes", id));
  }

  // ---------- AHORROS ----------
  async function agregarAhorro(data: Omit<Ahorro, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "ahorros"), data);
  }

  async function editarAhorro(id: string, d: Partial<Ahorro>) {
    if (!user) return;
    await updateDoc(doc(db, "usuarios", user.uid, "ahorros", id), d);
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
        cosasPorCobrar,     // 👈 nuevo
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
        editarCosaPorPagar,
        cambiarEstadoPago,

        agregarCosaPorCobrar,
        editarCosaPorCobrar,
        borrarCosaPorCobrar,
        marcarCobroComoCobrado,

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
  if (!ctx) throw new Error("useApp debe ir dentro de <AppProvider>");
  return ctx;
}
