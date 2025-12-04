"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loadingUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loadingUser && !user) {
      router.push("/login");
    }
  }, [loadingUser, user, router]);

  if (loadingUser) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-slate-500">
        Cargando...
      </div>
    );
  }

  return (
   <div className="flex">
  <Sidebar />

  <main className="flex-1 p-8 bg-slate-50 min-h-screen ml-64">
    {children}
  </main>
</div>

  );
}
