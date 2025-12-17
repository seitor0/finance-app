"use client";

import { useState } from "react";
import SidebarLink from "@/components/SidebarLink";
import { GastAPPLogo } from "@/components/GastAPPLogo";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside
        className="hidden lg:flex w-64 h-screen bg-[#111827] text-slate-200 p-6 flex-col gap-6 border-r border-white/10 fixed left-0 top-0"
      >
        <Logo />
        <div className="flex-1 overflow-y-auto">
          <Nav />
        </div>
        <AccountSection />
      </aside>

      {/* ===== MOBILE HEADER (BOTÓN MENÚ) ===== */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white/70 backdrop-blur-md sticky top-0 z-40">
        <button onClick={() => setOpen(true)}>
          <Menu size={28} className="text-slate-800" />
        </button>

        <h1 className="font-semibold text-lg">GastAPP</h1>

        <div className="w-6" />
      </div>

      {/* ===== MOBILE SIDEBAR (DRAWER) ===== */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Fondo oscuro */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel lateral */}
          <div className="absolute left-0 top-0 w-72 h-full bg-[#111827] text-slate-200 p-6 shadow-xl flex flex-col gap-6 animate-slideIn">
            <div className="flex items-center justify-between">
              <Logo />
              <button onClick={() => setOpen(false)}>
                <X size={26} />
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto">
              <Nav onClick={() => setOpen(false)} />
              <div className="mt-auto">
                <AccountSection onAction={() => setOpen(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* SUBCOMPONENTES */
function Logo() {
  return (
    <div className="flex items-center gap-3 mb-2">
      <GastAPPLogo size={34} />
      <div>
        <h1 className="text-xl font-semibold leading-tight">GastAPP</h1>
        <p className="text-xs text-slate-400 -mt-1">¿Dónde va mi plata?</p>
      </div>
    </div>
  );
}

function Nav({ onClick = () => {} }) {
  return (
    <nav className="flex flex-col gap-1" onClick={onClick}>
      <SidebarLink href="/dashboard" icon="home">
        Dashboard
      </SidebarLink>
      <SidebarLink href="/dashboard/ingresos" icon="arrow-up">
        Ingresos
      </SidebarLink>
      <SidebarLink href="/dashboard/gastos" icon="arrow-down">
        Gastos
      </SidebarLink>
      <SidebarLink href="/dashboard/ahorros" icon="piggy-bank">
        Ahorros
      </SidebarLink>
      <SidebarLink href="/dashboard/clientes" icon="users">
        Clientes
      </SidebarLink>
      <SidebarLink href="/dashboard/cosas-por-pagar" icon="credit-card">
        Cosas por pagar
      </SidebarLink>
      <SidebarLink href="/dashboard/cosas-por-cobrar" icon="dollar">
        Cosas por cobrar
      </SidebarLink>
      <SidebarLink href="/dashboard/tarjetas" icon="credit-card">
        Gastos con tarjeta
      </SidebarLink>
      <SidebarLink href="/dashboard/calendario-gastos" icon="calendar">
        Calendario de gastos
      </SidebarLink>
      <SidebarLink href="/dashboard/configuracion" icon="settings">
        Configuración
      </SidebarLink>
    </nav>
  );
}

function AccountSection({ onAction }: { onAction?: () => void }) {
  const { user, logout, loadingUser } = useAuth();

  if (!user) return null;

  const nombre = user.displayName || "Usuario sin nombre";
  const email = user.email || "—";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-widest text-slate-400">Cuenta</p>
      <div className="mt-2 space-y-0.5">
        <p className="text-sm font-semibold text-white">{nombre}</p>
        <p className="text-xs text-slate-400">{email}</p>
      </div>
      <button
        type="button"
        onClick={async () => {
          if (loadingUser) return;
          await logout();
          onAction?.();
        }}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50"
        disabled={loadingUser}
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </div>
  );
}
