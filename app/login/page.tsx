"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { loginWithGoogle, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-black flex items-center justify-center text-slate-50">
      {/* blobs de color tipo macOS */}
      <div className="pointer-events-none absolute -left-32 -top-32 w-80 h-80 bg-purple-500/40 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 w-80 h-80 bg-blue-500/30 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-3xl rounded-full" />

      {/* tarjeta central */}
      <div className="relative glass-card max-w-md w-full bg-white/10 border border-white/25 text-slate-50 fade-up">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-300 mb-2">
            FinanceApp OS
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Bienvenido de nuevo
          </h1>
          <p className="text-sm text-slate-300 mt-2">
            Organizá tus ingresos, gastos y objetivos con una vista clara y limpia.
          </p>
        </div>

        <button
          onClick={loginWithGoogle}
          disabled={loading}
          className="w-full mt-4 bg-white text-slate-900 hover:bg-slate-100 px-4 py-3 rounded-xl font-medium flex items-center justify-center gap-3 transition-colors"
        >
          {loading ? (
            "Cargando..."
          ) : (
            <>
              <span className="inline-flex w-5 h-5 rounded-[6px] overflow-hidden">
                <span className="w-full h-full bg-gradient-to-br from-amber-400 via-red-500 to-blue-500" />
              </span>
              Continuar con Google
            </>
          )}
        </button>

        <p className="text-[11px] text-slate-400 mt-4 text-center">
          Usamos tu cuenta solo para identificarte. Tus datos financieros quedan privados.
        </p>
      </div>
    </div>
  );
}
