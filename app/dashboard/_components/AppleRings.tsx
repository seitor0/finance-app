"use client";

type AppleRingsProps = {
  ingresosMes: number;
  gastosMes: number;
};

export default function AppleRings({ ingresosMes, gastosMes }: AppleRingsProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const dayOfMonth = now.getDate();

  const balance = Math.max(ingresosMes - gastosMes, 0);

  const ring1Ratio = ingresosMes > 0 ? Math.min(gastosMes / ingresosMes, 1) : 0; // uso vs ingresos
  const ring2Ratio = ingresosMes > 0 ? Math.min(balance / ingresosMes, 1) : 0;    // ahorro vs ingresos
  const ring3Ratio = dayOfMonth / daysInMonth;                                     // progreso del mes

  const r1 = 58;
  const r2 = 44;
  const r3 = 30;
  const c1 = 2 * Math.PI * r1;
  const c2 = 2 * Math.PI * r2;
  const c3 = 2 * Math.PI * r3;

  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <g transform="translate(80,80) rotate(-90)">
          {/* bases */}
          <circle r={r1} fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth={10} />
          <circle r={r2} fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth={10} />
          <circle r={r3} fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth={10} />

          {/* gasto */}
          <circle
            r={r1}
            fill="none"
            stroke="url(#ring1grad)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={c1}
            strokeDashoffset={c1 * (1 - ring1Ratio)}
            style={{ transition: "stroke-dashoffset 0.7s ease-out" }}
          />

          {/* ahorro */}
          <circle
            r={r2}
            fill="none"
            stroke="url(#ring2grad)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={c2}
            strokeDashoffset={c2 * (1 - ring2Ratio)}
            style={{ transition: "stroke-dashoffset 0.7s ease-out" }}
          />

          {/* progreso del mes */}
          <circle
            r={r3}
            fill="none"
            stroke="url(#ring3grad)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={c3}
            strokeDashoffset={c3 * (1 - ring3Ratio)}
            style={{ transition: "stroke-dashoffset 0.7s ease-out" }}
          />
        </g>

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
        </defs>
      </svg>

      <div className="space-y-2 text-sm">
        <p className="text-slate-600 text-xs uppercase tracking-[0.18em]">
          Actividad del mes
        </p>
        <p className="text-sm text-slate-800">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-400 mr-2" />
          Gastos / Ingresos:{" "}
          <strong>{Math.round(ring1Ratio * 100)}%</strong>
        </p>
        <p className="text-sm text-slate-800">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mr-2" />
          Ahorro del mes:{" "}
          <strong>{Math.round(ring2Ratio * 100)}%</strong>
        </p>
        <p className="text-sm text-slate-800">
          <span className="inline-block w-2 h-2 rounded-full bg-sky-400 mr-2" />
          Mes transcurrido:{" "}
          <strong>{Math.round(ring3Ratio * 100)}%</strong>
        </p>
      </div>
    </div>
  );
}
