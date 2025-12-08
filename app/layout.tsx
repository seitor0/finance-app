// ❌ NO usar "use client" aquí

import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";

export const metadata = {
  title: "Finance App",
  description: "Control personal de finanzas, gastos e ingresos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="font-inter font-sans bg-background text-foreground">
        {/* Providers deben ir dentro del <body>, nunca fuera */}
        <AuthProvider>
          <AppProvider>{children}</AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
