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

// =======================================================
// TIPOS
// =======================================================
export type PaymentStatus = "pagado" | "falta" | "pospuesto";
export type CobroStatus = "terminado" | "facturado" | "cobrado";

export interface ToPayItem {
  id: string;
  nombre: string;
  categoria?: string;
  monto: number;
  vencimiento?: string;
  status: PaymentStatus;
  importante?: boolean;
}

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
  tipo: "Ingreso" | "Gasto" | "Tarjeta";
  tarjeta?: string;
  fecha_pago?: string;
  liquidado?: boolean;
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

// Convertir cualquier cosa a número seguro
function toNumber(value: any): number {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

// =======================================================
// CONTEXTO
// =======================================================
interface AppContextType {
  ingresos: Movimiento[];
  gastos: Movimiento[];
  clientes: Cliente[];
  cosasPorPagar: ToPayItem[];
  cosasPorCobrar: ToCollectItem[];
  ahorros: Ahorro[];

  dineroDisponible: number;
  balanceReal: number;

  loadingData: boolean;

  agregarIngreso: (d: Omit<Movimiento, "id">) => Promise<void>;
  editarIngreso: (id: string, d: Partial<Movimiento>) => Promise<void>;
  borrarIngreso: (id: string) => Promise<void>;

  agregarGasto: (d: Omit<Movimiento, "id">) => Promise<void>;
  agregarGastoTarjeta: (d: Omit<Movimiento, "id">) => Promise<void>;
  editarGasto: (id: string, d: Partial<Movimiento>) => Promise<void>;
  borrarGasto: (id: string) => Promise<void>;

  agregarCosaPorPagar: (d: Omit<ToPayItem, "id">) => Promise<void>;
  editarCosaPorPagar: (id: string, d: Partial<ToPayItem>) => Promise<void>;
  cambiarEstadoPago: (id: string, estado: PaymentStatus) => Promise<void>;

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

// =======================================================
// PROVIDER
// =======================================================
export function AppProvider({ children }: { children: ReactNode }) {
  const { user, loadingUser } = useAuth();

  const [ingresos, setIngresos] = useState<Movimiento[]>([]);
  const [gastos, setGastos] = useState<Movimiento[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cosasPorPagar, setCosasPorPagar] = useState<ToPayItem[]>([]);
  const [cosasPorCobrar, setCosasPorCobrar] = useState<ToCollectItem[]>([]);
  const [ahorros, setAhorros] = useState<Ahorro[]>([]);

  const [dineroDisponible, setDineroDisponible] = useState(0);
  const [balanceReal, setBalanceReal] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  // =======================================================
  // SUBSCRIPCIONES FIRESTORE
  // =======================================================
  useEffect(() => {
    if (loadingUser) return; // Firebase inicializando

    if (!user) {
      // Si NO hay usuario → limpiar todo
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

    // Suscripciones
    const unsubIngresos = onSnapshot(
      query(collection(db, "usuarios", uid, "ingresos"), orderBy("fecha", "desc")),
      (snap) =>
        setIngresos(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              monto: toNumber(data.monto),
              tipo: (data.tipo as Movimiento["tipo"]) ?? "Ingreso",
            } as Movimiento;
          })
        )
    );

    const unsubGastos = onSnapshot(
      query(collection(db, "usuarios", uid, "gastos"), orderBy("fecha", "desc")),
      (snap) =>
        setGastos(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              monto: toNumber(data.monto),
              tipo: (data.tipo as Movimiento["tipo"]) ?? "Gasto",
            } as Movimiento;
          })
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
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            monto: toNumber(d.data().monto),
          })) as ToPayItem[]
        )
    );

    const unsubCobrar = onSnapshot(
      collection(db, "usuarios", uid, "cosasPorCobrar"),
      (snap) =>
        setCosasPorCobrar(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            monto: toNumber(d.data().monto),
          })) as ToCollectItem[]
        )
    );

    const unsubAhorros = onSnapshot(
      collection(db, "usuarios", uid, "ahorros"),
      (snap) =>
        setAhorros(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
          })) as Ahorro[]
        )
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

  // =======================================================
  // CÁLCULOS
  // =======================================================
  useEffect(() => {
    const totalIngresos = ingresos.reduce((a, i) => a + toNumber(i.monto), 0);
    const totalGastos = gastos.reduce((a, g) => a + toNumber(g.monto), 0);

    const totalPendientes = cosasPorPagar
      .filter((c) => c.status !== "pagado")
      .reduce((a, c) => a + toNumber(c.monto), 0);

    setDineroDisponible(totalIngresos - totalGastos);
    setBalanceReal(totalIngresos - totalGastos - totalPendientes);
  }, [ingresos, gastos, cosasPorPagar]);

  // =======================================================
  // CRUD (todos correctos y listos)
  // =======================================================

  async function agregarIngreso(d: Omit<Movimiento, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "ingresos"), {
      ...d,
      monto: toNumber(d.monto),
      tipo: "Ingreso",
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

  async function agregarGasto(d: Omit<Movimiento, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "gastos"), {
      ...d,
      monto: toNumber(d.monto),
      tipo: "Gasto",
    });
  }

  // Tarjetas
  async function agregarGastoTarjeta(d: Omit<Movimiento, "id">) {
    if (!user) return;
    const ref = collection(db, "usuarios", user.uid, "movimientos");
    await addDoc(ref, {
      ...d,
      monto: toNumber(d.monto),
      tipo: "Tarjeta",
      liquidado: false,
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

  // COSAS POR PAGAR
  async function agregarCosaPorPagar(d: Omit<ToPayItem, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "cosasPorPagar"), {
      ...d,
      monto: toNumber(d.monto),
    });
  }

  async function editarCosaPorPagar(id: string, d: Partial<ToPayItem>) {
    if (!user) return;
    await updateDoc(doc(db, "usuarios", user.uid, "cosasPorPagar", id), d);
  }

  async function cambiarEstadoPago(id: string, estado: PaymentStatus) {
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid, "cosasPorPagar", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const item = snap.data() as ToPayItem;

    if (estado === "pagado") {
      const fecha = new Date().toISOString().slice(0, 10);
      await addDoc(collection(db, "usuarios", user.uid, "gastos"), {
        descripcion: item.nombre,
        categoria: item.categoria || "",
        monto: toNumber(item.monto),
        fecha,
      });

      await deleteDoc(ref);
      return;
    }

    await updateDoc(ref, { status: estado });
  }

  // COSAS POR COBRAR
  async function agregarCosaPorCobrar(d: Omit<ToCollectItem, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "cosasPorCobrar"), {
      ...d,
      monto: toNumber(d.monto),
    });
  }

  async function editarCosaPorCobrar(id: string, d: Partial<ToCollectItem>) {
    if (!user) return;

    const ref = doc(db, "usuarios", user.uid, "cosasPorCobrar", id);
    const snap = await getDoc(ref);
    const prev = snap.data() as ToCollectItem | undefined;

    if (!prev) return;

    const nuevoEstado = d.status ?? prev.status;

    if (prev.status !== "cobrado" && nuevoEstado === "cobrado") {
      const fecha = new Date().toISOString().slice(0, 10);

      await addDoc(collection(db, "usuarios", user.uid, "ingresos"), {
        descripcion: prev.nombre,
        monto: toNumber(prev.monto),
        fecha,
        categoria: "Cobros",
      });

      await deleteDoc(ref);
      return;
    }

    await updateDoc(ref, d);
  }

  async function borrarCosaPorCobrar(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "cosasPorCobrar", id));
  }

  async function marcarCobroComoCobrado(item: ToCollectItem) {
    if (!user) return;

    const fecha = new Date().toISOString().slice(0, 10);

    await addDoc(collection(db, "usuarios", user.uid, "ingresos"), {
      descripcion: item.nombre,
      monto: toNumber(item.monto),
      fecha,
      categoria: "Cobros",
    });

    await deleteDoc(doc(db, "usuarios", user.uid, "cosasPorCobrar", item.id));
  }

  // CLIENTES
  async function agregarCliente(d: Omit<Cliente, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "clientes"), d);
  }

  async function editarCliente(id: string, d: Partial<Cliente>) {
    if (!user) return;
    await updateDoc(doc(db, "usuarios", user.uid, "clientes", id), d);
  }

  async function borrarCliente(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "clientes", id));
  }

  // AHORROS
  async function agregarAhorro(d: Omit<Ahorro, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "ahorros"), d);
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
        cosasPorCobrar,
        ahorros,
        dineroDisponible,
        balanceReal,
        loadingData,

        agregarIngreso,
        editarIngreso,
        borrarIngreso,

        agregarGasto,
        agregarGastoTarjeta,
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
