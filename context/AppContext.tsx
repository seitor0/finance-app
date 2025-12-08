"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
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
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { calcularCiclo, formatoInputDate } from "@/lib/tarjetaCiclos";

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
  tarjeta_id?: string;
  tarjeta_nombre?: string;
  fecha_pago?: string;
  ciclo_id?: string;
  ciclo_desde?: string;
  ciclo_hasta?: string;
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

type TarjetaConfig = {
  id: string;
  nombre: string;
  banco?: string;
  dia_cierre?: number;
  dia_vencimiento?: number;
  cierre?: number;
  vencimiento?: number;
  color?: string;
};

export interface Categoria {
  id: string;
  nombre: string;
  color: string;
  tipo: "Gasto" | "Ingreso";
}

export interface Tarjeta {
  id: string;
  nombre: string;
  banco?: string;
  color?: string;
  dia_cierre?: number;
  dia_vencimiento?: number;
}

export interface PendienteTarjeta {
  tarjeta_id: string;
  ciclo_id: string;
  tarjeta_nombre: string;
  fecha_pago?: string;
  ciclo_desde?: string;
  ciclo_hasta?: string;
  total: number;
  cantidad: number;
  compras: Movimiento[];
}

// Convertir cualquier cosa a número seguro
function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
}

// =======================================================
// CONTEXTO
// =======================================================
interface AppContextType {
  ingresos: Movimiento[];
  gastos: Movimiento[];
  gastosPagados: Movimiento[];
  gastosConsumo: Movimiento[];
  clientes: Cliente[];
  cosasPorPagar: ToPayItem[];
  cosasPorCobrar: ToCollectItem[];
  ahorros: Ahorro[];
  categorias: Categoria[];
  tarjetas: Tarjeta[];
  pendientesTarjeta: PendienteTarjeta[];

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
  liquidarCiclo: (tarjetaId: string, cicloId: string, compras?: Movimiento[]) => Promise<void>;

  agregarCategoria: (d: Omit<Categoria, "id">) => Promise<void>;
  editarCategoria: (id: string, d: Partial<Omit<Categoria, "id">>) => Promise<void>;
  borrarCategoria: (id: string) => Promise<void>;

  agregarTarjeta: (d: Omit<Tarjeta, "id">) => Promise<void>;
  editarTarjeta: (id: string, d: Partial<Tarjeta>) => Promise<void>;
  borrarTarjeta: (id: string) => Promise<void>;
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
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [tarjetas, setTarjetas] = useState<Tarjeta[]>([]);

  const [dineroDisponible, setDineroDisponible] = useState(0);
  const [balanceReal, setBalanceReal] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  function resetAllData() {
    setIngresos([]);
    setGastos([]);
    setClientes([]);
    setCosasPorPagar([]);
    setCosasPorCobrar([]);
    setAhorros([]);
    setCategorias([]);
    setTarjetas([]);
    setDineroDisponible(0);
    setBalanceReal(0);
  }

  // =======================================================
  // SUBSCRIPCIONES FIRESTORE
  // =======================================================
  useEffect(() => {
    if (loadingUser) return; // Firebase inicializando

    if (!user) {
      const timer = setTimeout(() => {
        resetAllData();
        setLoadingData(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const uid = user.uid;
    const startLoadingTimer = setTimeout(() => setLoadingData(true), 0);

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

    const unsubCategorias = onSnapshot(
      collection(db, "usuarios", uid, "categorias"),
      (snap) =>
        setCategorias(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Categoria, "id">) }))
        )
    );

    const unsubTarjetas = onSnapshot(
      collection(db, "usuarios", uid, "tarjetas"),
      (snap) =>
        setTarjetas(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Tarjeta, "id">) }))
        )
    );

    const finishLoadingTimer = setTimeout(() => setLoadingData(false), 0);

    return () => {
      clearTimeout(startLoadingTimer);
      clearTimeout(finishLoadingTimer);
      unsubIngresos();
      unsubGastos();
      unsubClientes();
      unsubPagar();
      unsubCobrar();
      unsubAhorros();
      unsubCategorias();
      unsubTarjetas();
    };
  }, [user, loadingUser]);

  const pendientesTarjeta = useMemo(() => {
    const grupos = new Map<string, PendienteTarjeta>();

    for (const gasto of gastos) {
      if (gasto.tipo !== "Tarjeta" || gasto.liquidado) continue;

      const tarjetaId = gasto.tarjeta_id ?? gasto.tarjeta_nombre ?? gasto.tarjeta ?? "sin-id";
      const cicloId = gasto.ciclo_id ?? gasto.fecha_pago ?? "sin-ciclo";
      const key = `${tarjetaId}-${cicloId}`;

      if (!grupos.has(key)) {
        grupos.set(key, {
          tarjeta_id: tarjetaId,
          ciclo_id: cicloId,
          tarjeta_nombre: gasto.tarjeta_nombre || gasto.tarjeta || "Tarjeta",
          fecha_pago: gasto.fecha_pago,
          ciclo_desde: gasto.ciclo_desde,
          ciclo_hasta: gasto.ciclo_hasta,
          total: 0,
          cantidad: 0,
          compras: [],
        });
      }

      const ref = grupos.get(key)!;
      ref.total += toNumber(gasto.monto);
      ref.cantidad += 1;
      ref.compras.push(gasto);

      if (!ref.fecha_pago && gasto.fecha_pago) ref.fecha_pago = gasto.fecha_pago;
      if (!ref.ciclo_desde && gasto.ciclo_desde) ref.ciclo_desde = gasto.ciclo_desde;
      if (!ref.ciclo_hasta && gasto.ciclo_hasta) ref.ciclo_hasta = gasto.ciclo_hasta;
    }

    const sortValue = (item: PendienteTarjeta) => item.fecha_pago ?? `${item.ciclo_id}-zz`;

    return Array.from(grupos.values()).sort((a, b) => sortValue(a).localeCompare(sortValue(b)));
  }, [gastos]);

  const gastosPagados = useMemo(
    () =>
      gastos.filter(
        (g) => g.tipo === "Gasto" || (g.tipo === "Tarjeta" && g.liquidado)
      ),
    [gastos]
  );

  const gastosConsumo = useMemo(() => [...gastos], [gastos]);

  // =======================================================
  // CÁLCULOS
  // =======================================================
  useEffect(() => {
    const totalIngresos = ingresos.reduce((a, i) => a + toNumber(i.monto), 0);
    const totalGastosReg = gastosPagados.reduce((a, g) => a + toNumber(g.monto), 0);
    const totalPendientes = cosasPorPagar
      .filter((c) => c.status !== "pagado")
      .reduce((a, c) => a + toNumber(c.monto), 0);

    const timer = setTimeout(() => {
      setDineroDisponible(totalIngresos - totalGastosReg);
      setBalanceReal(totalIngresos - totalGastosReg - totalPendientes);
    }, 0);

    return () => clearTimeout(timer);
  }, [ingresos, gastosPagados, cosasPorPagar]);

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
    if (!d.tarjeta_id) {
      throw new Error("Seleccioná una tarjeta válida.");
    }

    const tarjetaSnap = await getDoc(
      doc(db, "usuarios", user.uid, "tarjetas", d.tarjeta_id)
    );
    if (!tarjetaSnap.exists()) {
      throw new Error("La tarjeta seleccionada ya no existe.");
    }

    const tarjeta = { id: tarjetaSnap.id, ...(tarjetaSnap.data() as TarjetaConfig) };
    const diaCierre = tarjeta.dia_cierre ?? tarjeta.cierre;
    const diaVenc = tarjeta.dia_vencimiento ?? tarjeta.vencimiento;

    if (!diaCierre || !diaVenc) {
      throw new Error("Configurá el día de cierre y vencimiento de la tarjeta.");
    }

    const fechaCompra = d.fecha ?? formatoInputDate(new Date());
    const ciclo = calcularCiclo(fechaCompra, diaCierre, diaVenc);

    await addDoc(collection(db, "usuarios", user.uid, "gastos"), {
      descripcion: d.descripcion,
      categoria: d.categoria ?? "Tarjeta",
      monto: toNumber(d.monto),
      fecha: fechaCompra,
      tipo: "Tarjeta",
      tarjeta_id: tarjeta.id,
      tarjeta_nombre: tarjeta.nombre,
      tarjeta: tarjeta.nombre,
      fecha_pago: formatoInputDate(ciclo.fecha_pago),
      ciclo_id: ciclo.ciclo_id,
      ciclo_desde: formatoInputDate(ciclo.desde),
      ciclo_hasta: formatoInputDate(ciclo.hasta),
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

  async function liquidarCiclo(
    tarjetaId: string,
    cicloId: string,
    compras?: Movimiento[]
  ) {
    if (!user) return;

    let pendientes = compras;
    const ref = collection(db, "usuarios", user.uid, "gastos");

    if (!pendientes || pendientes.length === 0) {
      const q = query(
        ref,
        where("tipo", "==", "Tarjeta"),
        where("tarjeta_id", "==", tarjetaId),
        where("ciclo_id", "==", cicloId),
        where("liquidado", "==", false)
      );
      const snap = await getDocs(q);
      pendientes = snap.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Movimiento),
      }));
    }

    if (!pendientes || pendientes.length === 0) return;

    let total = 0;
    let tarjetaNombre = "";
    let fechaPago = "";

    pendientes.forEach((mov) => {
      total += toNumber(mov.monto);
      if (!tarjetaNombre) {
        tarjetaNombre = mov.tarjeta_nombre || mov.tarjeta || "Tarjeta";
      }
      if (!fechaPago && mov.fecha_pago) {
        fechaPago = mov.fecha_pago;
      }
    });

    const batch = writeBatch(db);
    const gastoNormalRef = doc(collection(db, "usuarios", user.uid, "gastos"));
    batch.set(gastoNormalRef, {
      descripcion: `Pago tarjeta ${tarjetaNombre} ${cicloId}`,
      categoria: "Tarjetas",
      monto: total,
      fecha: fechaPago || formatoInputDate(new Date()),
      tipo: "Gasto",
    });

    pendientes.forEach((mov) => {
      batch.update(doc(db, "usuarios", user.uid, "gastos", mov.id), {
        liquidado: true,
      });
    });

    await batch.commit();
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

  // CATEGORÍAS
  async function agregarCategoria(d: Omit<Categoria, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "categorias"), d);
  }

  async function editarCategoria(id: string, d: Partial<Omit<Categoria, "id">>) {
    if (!user) return;
    await updateDoc(doc(db, "usuarios", user.uid, "categorias", id), d);
  }

  async function borrarCategoria(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "categorias", id));
  }

  // TARJETAS
  async function agregarTarjeta(d: Omit<Tarjeta, "id">) {
    if (!user) return;
    await addDoc(collection(db, "usuarios", user.uid, "tarjetas"), d);
  }

  async function editarTarjeta(id: string, d: Partial<Tarjeta>) {
    if (!user) return;
    await updateDoc(doc(db, "usuarios", user.uid, "tarjetas", id), d);
  }

  async function borrarTarjeta(id: string) {
    if (!user) return;
    await deleteDoc(doc(db, "usuarios", user.uid, "tarjetas", id));
  }

  return (
    <AppContext.Provider
      value={{
        ingresos,
        gastos,
        gastosPagados,
        gastosConsumo,
        clientes,
        cosasPorPagar,
        cosasPorCobrar,
        ahorros,
        categorias,
        tarjetas,
        pendientesTarjeta,
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

        liquidarCiclo,
        agregarCategoria,
        editarCategoria,
        borrarCategoria,
        agregarTarjeta,
        editarTarjeta,
        borrarTarjeta,
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
