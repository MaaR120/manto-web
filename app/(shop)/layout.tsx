// src/app/(shop)/layout.tsx

import Footer from "@/components/Footer"; 

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Envolvemos todo (Navbar + Hijos + Footer) con el Provider
    <>
      <main className="min-h-screen">
         {children}
      </main>
      <Footer />
    </>

  );
}