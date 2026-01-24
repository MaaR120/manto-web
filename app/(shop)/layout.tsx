// src/app/(shop)/layout.tsx

import Navbar from "@/components/Navbar"; 
import Footer from "@/components/Footer"; 
import { CartProvider } from "@/context/CartContext"; // <--- Importamos el Provider

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Envolvemos todo (Navbar + Hijos + Footer) con el Provider
    <CartProvider>
      <Navbar />
      <main className="min-h-screen">
         {children}
      </main>
      <Footer />
    </CartProvider>
  );
}