export function GastAPPLogo({ size = 90 }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-3xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-xl"
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 100 100"
        fill="none"
        stroke="white"
        strokeWidth="10"
        strokeLinecap="round"
      >
        <path d="M50 15 V85" />
        <path d="M30 30 Q50 15 70 30" />
        <path d="M30 70 Q50 85 70 70" />
      </svg>
    </div>
  );
}
