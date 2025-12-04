"use client";

import SidebarLink from "@/components/SidebarLink";
import { GastAPPLogo } from "@/components/GastAPPLogo";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-[#111827] text-slate-200 p-6 flex flex-col gap-6 border-r border-white/10">

      {/* LOGO + TÍTULO (COMPACTO, ELEGANTE) */}
      <div className="flex items-center gap-3 mb-2">
        <GastAPPLogo size={34} />
        <div>
          <h1 className="text-xl font-semibold leading-tight">GastAPP</h1>
          <p className="text-xs text-slate-400 -mt-1">¿Dónde va mi plata?</p>
        </div>
      </div>

      {/* NAV */}
      <nav className="flex flex-col gap-1">

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
    </aside>
  );
}
