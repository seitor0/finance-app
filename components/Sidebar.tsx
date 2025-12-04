"use client";

import { useState } from "react";
import SidebarLink from "@/components/SidebarLink";
import { GastAPPLogo } from "@/components/GastAPPLogo";
import { Menu, X } from "lucide-react";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside
        className="hidden lg:flex w-64 h-screen bg-[#111827] text-slate-200 p-6 flex-col gap-6 border-r border-white/10 fixed left-0 top-0"
      >
        <Logo />
        <Nav />
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

            <Nav onClick={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

/* COMPONENTES INTERNOS */
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
      <SidebarLink href="/dashboard/configuracion" icon="settings">
        Configuración
      </SidebarLink>
    </nav>
  );
}
