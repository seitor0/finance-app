"use client"; 
import "./globals.css"; 
import { AuthProvider } from "@/context/AuthContext"; 
import { AppProvider } from "@/context/AppContext"; 

export default function RootLayout({ 
  children, 

}: { 
  children: React.ReactNode;

 }) { 
  return ( 
<html lang="es"> 
<body> 
  <AuthProvider> 
  <AppProvider> 
  {children} 
</AppProvider> 
</AuthProvider> 
</body> 
</html> 

); 
}