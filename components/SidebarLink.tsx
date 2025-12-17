"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const ICONS: Record<string, string> = {
  home: "🏠",
  "arrow-up": "⬆️",
  "arrow-down": "⬇️",
  "piggy-bank": "🐷",
  users: "👥",
  "credit-card": "💳",
  dollar: "💲",
  calendar: "📅",
  settings: "⚙️",
};

export default function SidebarLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <motion.div
      whileHover={{ x: 3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
          active
            ? "bg-white/10 text-white"
            : "text-slate-400 hover:text-white hover:bg-white/5"
        )}
      >
        <span className="text-lg opacity-80">{ICONS[icon]}</span>
        {children}
      </Link>
    </motion.div>
  );
}
