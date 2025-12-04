"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GastAPPLogo } from "@/components/GastAPPLogo";



export default function WelcomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-black via-slate-900 to-slate-950 flex items-center justify-center text-white">

      {/* blobs estilo Apple */}
      <div className="pointer-events-none absolute top-[-120px] left-[-60px] w-[340px] h-[340px] bg-purple-500/30 blur-3xl rounded-full animate-pulse" />
      <div className="pointer-events-none absolute bottom-[-140px] right-[-80px] w-[380px] h-[380px] bg-blue-500/25 blur-3xl rounded-full animate-pulse" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-emerald-500/20 blur-[120px] rounded-full opacity-50" />

      {/* CONTENEDOR CENTRAL */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-card relative px-10 py-16 max-w-md w-full bg-white/10 border border-white/20 backdrop-blur-2xl rounded-3xl"
      >
        {/* LOGO ANIMADO */}
        <motion.div 
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
          className="flex justify-center mb-8"
        >
          <GastAPPLogo size={100} />
        </motion.div>

        {/* TÍTULO */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-4xl font-semibold tracking-tight text-center"
        >
          GastAPP
        </motion.h1>

        {/* BAJADA */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8 }}
          className="text-slate-300 text-center mt-3 text-lg leading-snug"
        >
          ¿Dónde va mi plata?
        </motion.p>

        {/* BOTÓN */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-10 flex justify-center"
        >
          <Link
            href="/login"
            className="px-10 py-4 bg-white text-slate-900 rounded-2xl font-medium text-lg shadow-lg hover:bg-slate-100 transition-colors flex items-center gap-2"
          >
            Comenzar
            <span className="text-xl">›</span>
          </Link>
        </motion.div>

        {/* MINI DISCLAIMER */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1.2, duration: 1.2 }}
          className="text-[11px] text-center mt-6 text-slate-400"
        >
          Una app privada para entender tus gastos reales.
        </motion.p>
      </motion.div>
    </div>
  );
}
