"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  type User,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

type AuthContextType = {
  user: User | null;
  loadingUser: boolean;
  loginLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  // 🔥 Detecta usuario logueado
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      // Si hay usuario → actualizar cookie para middleware
      if (currentUser) {
        const token = await currentUser.getIdToken();
        document.cookie = `authToken=${token}; path=/;`;
      }

      setLoadingUser(false);
    });

    return () => unsub();
  }, []);

  // 🔐 LOGIN GOOGLE
  async function loginWithGoogle() {
    try {
      setLoginLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Guardamos cookie para middleware
      const token = await result.user.getIdToken();
      document.cookie = `authToken=${token}; path=/;`;

      router.replace("/dashboard");
    } catch (error) {
      console.error("Error en login:", error);
    } finally {
      setLoginLoading(false);
    }
  }

  // 🚪 LOGOUT
  async function logout() {
    try {
      await signOut(auth);

      // borrar cookie
      document.cookie = "authToken=; path=/; max-age=0;";

      router.replace("/login");
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
