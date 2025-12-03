"use client";

type AppleRingsProps = {
  ingresosMes: number;
  gastosMes: number;
  pendientesMes: number;       // deudas
  cobrosPendientes: number;    // 👈 NUEVO
};

export default function AppleRings({
  ingresosMes,
  gastosMes,
  pendientesMes,
  cobrosPendientes
}: AppleRingsProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayOfMonth = now.getDate();

  const balance = Math.max(ingresosMes - gastosMes, 0);

  // ❗ Ratios
  const ring1Ratio = ingresosMes > 0 ? Math.min(gastosMes / ingresosMes, 1) : 0;        // Gastos
  const ring2Ratio = ingresosMes > 0 ? Math.min(balance / ingresosMes, 1) : 0;          // Ahorro
  const ring3Ratio = dayOfMonth / daysInMonth;                                          // Mes
  const ring4Ratio = ingresosMes > 0 ? Math.min(pendientesMes / ingresosMes, 1) : 0;    // Deudas
  const ring5Ratio = ingresosMes > 0 ? Math.min(cobrosPendientes / ingresosMes, 1) : 0; // Cobros pendientes

  // Radios
  const r1 = 70;
  const r2 = 56;
  const r3 = 42;
  const r4 = 28;
  const r5 = 14; // 👈 NUEVO anillo

  const c1 = 2 * Math.PI * r1;
  const c2 = 2 * Math.PI * r2;
  const c3 = 2 * Math.PI * r3;
  const c4 = 2 * Math.PI * r4;
  const c5 = 2 * Math.PI * r5;

  return (
    <div className="flex items-center gap-6">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <g transform="translate(90,90) rotate(-90)">
          {/* Bases */}
          <circle r={r1} fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth={10} />
          <circle r={r2} fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth={10} />
          <circle r={r3} fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth={10} />
          <circle r={r4} fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth={10} />
          <circle r={r5} fill="none" stroke="rgba(148,163,184,0.22)" strokeWidth={10} />

          {/* Gastos */}
          <circle
            r={r1}
            fill="none"
            stroke="url(#ring1grad)"
            strokeWidth={10}
            strokeDasharray={c1}
            strokeDashoffset={c1 * (1 - ring1Ratio)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.7s ease-out" }}
          />

          {/* Ahorro */}
          <circle
            r={r2}
            fill="none"
            stroke="url(#ring2grad)"
            strokeWidth={10}
            strokeDasharray={c2}
            strokeDashoffset={c2 * (1 - ring2Ratio)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.7s ease-out" }}
          />

          {/* Mes */}
          <circle
            r={r3}
            fill="none"
            stroke="url(#ring3grad)"
            strokeWidth={10}
            strokeDasharray={c3}
            strokeDashoffset={c3 * (1 - ring3Ratio)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.7s ease-out" }}
          />

          {/* Deudas */}
          <circle
            r={r4}
            fill="none"
            stroke="url(#ring4grad)"
            strokeWidth={10}
            strokeDasharray={c4}
            strokeDashoffset={c4 * (1 - ring4Ratio)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.7s ease-out" }}
          />

          {/* Cobros pendientes (nuevo) */}
          <circle
            r={r5}
            fill="none"
            stroke="url(#ring5grad)"
            strokeWidth={10}
            strokeDasharray={c5}
            strokeDashoffset={c5 * (1 - ring5Ratio)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.7s ease-out" }}
          />
        </g>

        {/* COLORES GRADIENTES */}
        <defs>
          <linearGradient id="ring1grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>

          <linearGradient id="ring2grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>

          <linearGradient id="ring3grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>

          <linearGradient id="ring4grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* NUEVO: COBROS PENDIENTES */}
          <linearGradient id="ring5grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>

      {/* Texto de indicadores */}
      <div className="space-y-2 text-sm">
        <p className="text-slate-600 text-xs uppercase tracking-[0.18em]">
          Actividad del mes
        </p>

        <p className="text-sm text-slate-800">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-400 mr-2" />
          Gastos / Ingresos: <strong>{Math.round(ring1Ratio * 100)}%</strong>
        </p>

        <p className="text-sm text-slate-800">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2" />
          Ahorro del mes: <strong>{Math.round(ring2Ratio * 100)}%</strong>
        </p>

        <p className="text-sm text-slate-800">
          <span className="inline-block w-2 h-2 rounded-full bg-sky-400 mr-2" />
          Mes transcurrido: <strong>{Math.round(ring3Ratio * 100)}%</strong>
        </p>

        <p className="text-sm text-slate-800">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-2" />
          Deudas: <strong>{Math.round(ring4Ratio * 100)}%</strong>
        </p>

        <p className="text-sm text-slate-800">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2" />
          Cobros pendientes: <strong>{Math.round(ring5Ratio * 100)}%</strong>
        </p>
      </div>
    </div>
  );
}
