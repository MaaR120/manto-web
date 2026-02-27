import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabaseServer";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/context/CartContext"; // <--- Importamos el Provider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MANTO",
  description: "Yerba mate de origen",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let isAdmin = false;

  if (user) {
    // Busca en tu tabla 'cliente' o 'usuarios'
    const { data: usuarioDb } = await supabase
      .from('cliente') 
      .select('rol')
      .eq('id_auth', user.id)
      .single();
      
    isAdmin = usuarioDb?.rol === 'admin';
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CartProvider>
          <Navbar isAdmin={isAdmin} />
        {children}
        </CartProvider>
      </body>
    </html>
  );
}
