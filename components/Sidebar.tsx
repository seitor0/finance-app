"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Íconos heroicons + lucide
import {
  HomeIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  Cog6ToothIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

import {
  PiggyBank,
  ListTodo,
  DollarSign,
} from "lucide-react";

const menu = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    label: "Ingresos",
    href: "/dashboard/ingresos",
    icon: ArrowUpCircleIcon,
  },
  {
    label: "Gastos",
    href: "/dashboard/gastos",
    icon: ArrowDownCircleIcon,
  },
  {
    label: "Ahorros",
    href: "/dashboard/ahorros",
    icon: PiggyBank,
  },
  {
    label: "Clientes",
    href: "/dashboard/clientes",
    icon: UserGroupIcon,
  },
  {
    label: "Cosas por pagar",
    href: "/dashboard/cosas-por-pagar",
    icon: ListTodo,
  },
  {
    label: "Configuración",
    href: "/dashboard/configuracion",
    icon: Cog6ToothIcon,
  },
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
                flex items-center gap-3 px-4 py-2 rounded-lg text-[15px] font-medium transition
                ${
                  active
                    ? "bg-gray-700 text-white shadow-sm"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }
              `}
            >
              {Icon && <Icon className="w-5 h-5 flex-none" />}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
