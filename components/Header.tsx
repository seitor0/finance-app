"use client";

export default function Header() {
  return (
    <header className="w-full bg-white border-b px-6 py-4 flex items-center justify-between">
      <h2 className="text-xl font-semibold text-gray-800">Panel</h2>

      <button className="rounded-full bg-gray-900 text-white px-4 py-2 text-sm">
        Mi Cuenta
      </button>
    </header>
  );
}
