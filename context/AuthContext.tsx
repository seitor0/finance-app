"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

type AuthContextType = {
  user: any;
  loadingUser: boolean;      // 👈 Estado real de Firebase Auth
  loginLoading: boolean;     // 👈 Loading solo del login manual
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);   // 👈 Firebase inicializando
  const [loginLoading, setLoginLoading] = useState(false); // 👈 Botón de login cargando

  // 🔥 Detecta siempre si hay usuario logueado (Firebase AUTH)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      console.log("🔐 Usuario detectado:", currentUser);
      setUser(currentUser);
      setLoadingUser(false); // 👈 Termina carga inicial de Firebase
    });

    return () => unsub();
  }, []);

  async function loginWithGoogle() {
    try {
      setLoginLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error en login:", error);
    } finally {
      setLoginLoading(false);
    }
  }

  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loadingUser,
        loginLoading,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
