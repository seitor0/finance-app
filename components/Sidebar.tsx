"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PiggyBank, ListTodo } from "lucide-react";

const menu = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Ingresos", href: "/dashboard/ingresos" },
  { label: "Gastos", href: "/dashboard/gastos" },
  { label: "Ahorros", href: "/dashboard/ahorros", icon: PiggyBank },
  { label: "Clientes", href: "/dashboard/clientes" },
  { label: "Cosas por pagar", href: "/dashboard/cosas-por-pagar", icon: ListTodo },
  { label: "Configuración", href: "/dashboard/configuracion" },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-gray-100 h-screen p-6 shadow-xl overflow-y-auto">
      <h1 className="text-2xl font-bold mb-1 tracking-tight">FinanceApp</h1>
      <p className="text-xs text-gray-400 mb-8 -mt-1">¿Dónde va mi plata?</p>

      <nav className="flex flex-col gap-2">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = path === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition
                ${
                  active
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }
              `}
            >
              {Icon && <Icon size={16} />}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
