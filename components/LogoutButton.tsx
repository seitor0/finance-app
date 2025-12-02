"use client";

import { useAuth } from "@/context/AuthContext";

export default function LogoutButton() {
  const { logout, loading } = useAuth();

  return (
    <button
      onClick={logout}
      disabled={loading}
      className="fixed bottom-6 left-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg z-50"
    >
      Cerrar sesión
    </button>
  );
}
