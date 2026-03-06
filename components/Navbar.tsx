"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, User, Leaf, LogOut, Loader2, LayoutDashboard, X, Trash2, ArrowRight, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/utils/format";

interface NavbarProps {
  isAdmin?: boolean;
}

export default function Navbar({ isAdmin = false }: NavbarProps) {

  const router = useRouter();

  // ESTADOS
  const [isAdminState, setIsAdminState] = useState(isAdmin);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // 👇 NUEVO: Estado para controlar el menú de celular
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { cart, totalItems, totalPrice, removeFromCart, updateQuantity } = useCart();

  // USE EFFECT: LA MAGIA DE LA SINCRONIZACIÓN
  useEffect(() => {
    setIsAdminState(isAdmin);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (loading) return;

      if (event === 'SIGNED_OUT') {
        setIsAdminState(false);
        setIsCartOpen(false);
      }
      else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const { data } = await supabase
            .from('cliente')
            .select('rol')
            .eq('id_auth', session.user.id)
            .single();

          setIsAdminState(data?.rol === 'admin');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isAdmin, loading]);


  const handleLogout = async () => {
    setLoading(true);
    setIsAdminState(false);
    setIsCartOpen(false);
    setIsMobileMenuOpen(false); // Cerramos también el menú móvil por las dudas

    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise<void>((resolve) => setTimeout(resolve, 3000)),
      ]);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
    window.location.href = "/login";
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-manto-surface/90 backdrop-blur-md border-b border-manto-teal/5 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo y Marca */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-manto-teal tracking-tighter group">
              <Leaf className="text-manto-teal group-hover:text-manto-orange transition-colors duration-300" size={28} />
              <span>
                MANTO
                <span className="text-manto-orange">.</span>
              </span>
            </Link>
          </div>

          {/* Menú Desktop */}
          <div className="hidden md:flex space-x-8 items-center">
            {isAdminState && (
              <Link
                href="/admin"
                className="hidden md:flex bg-black text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-gray-800 transition-colors items-center gap-2 animate-in fade-in"
              >
                <LayoutDashboard size={16} />
                Admin
              </Link>
            )}

            <Link href="/#productos" className="text-manto-teal/80 hover:text-manto-orange transition-colors font-medium">
              Nuestros Productos
            </Link>
            <Link href="/#historia" className="text-manto-teal/80 hover:text-manto-orange transition-colors font-medium">
              Que nos Diferencia?
            </Link>
            <Link href="/#contacto" className="text-manto-teal/80 hover:text-manto-orange transition-colors font-medium">
              Contacto
            </Link>
          </div>

          {/* Iconos de Acción */}
          <div className="flex items-center space-x-4 md:space-x-6 text-manto-teal">

            {/* --- PERFIL DROPDOWN --- */}
            <div className="relative group py-4 hidden md:block">
              <button className="flex items-center hover:text-manto-orange transition-colors outline-none">
                <User size={22} />
              </button>
              <div className="absolute right-0 top-full w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 pt-2">
                <div className="bg-white rounded-2xl shadow-xl border border-manto-teal/10 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-manto-surface/50">
                    <p className="text-xs font-bold text-manto-teal uppercase tracking-wider">Mi Cuenta</p>
                  </div>
                  <div className="py-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-manto-teal/5 hover:text-manto-teal transition-colors">
                      <LayoutDashboard size={18} />
                      Mi Cuenta
                    </Link>
                    <button onClick={handleLogout} disabled={loading} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors text-left">
                      {loading ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />}
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* --- MINI CART DROPDOWN --- */}
            <div className="relative py-4">
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className={`relative flex items-center transition-colors ${isCartOpen ? 'text-manto-orange' : 'hover:text-manto-orange'}`}
              >
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-manto-orange text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold animate-in zoom-in">
                    {totalItems}
                  </span>
                )}
              </button>

              {isCartOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsCartOpen(false)} />

                  <div className="absolute right-0 top-full w-[300px] sm:w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-manto-teal/10 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">

                    {/* Header Cart */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                      <h3 className="font-bold text-manto-teal">Mi Carrito ({totalItems})</h3>
                      <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-manto-orange">
                        <X size={18} />
                      </button>
                    </div>

                    {/* Lista de Items Cart */}
                    <div className="max-h-[300px] overflow-y-auto p-4 space-y-4 custom-scrollbar">
                      {cart.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <ShoppingCart size={48} className="mx-auto mb-2 opacity-20" />
                          <p className="text-sm">Tu carrito está vacío</p>
                        </div>
                      ) : (
                        cart.map((item) => (
                          <div key={item.id} className="flex gap-3 items-start group border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                            {/* Imagen */}
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0 mt-1">
                              {item.imagen_url ? (
                                <Image src={item.imagen_url} alt={item.nombre} fill className="object-cover" />
                              ) : (
                                <span className="flex items-center justify-center h-full text-xl">🧉</span>
                              )}
                            </div>

                            {/* Info + Controles */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between h-full gap-2">
                              <div>
                                <p className="text-sm font-bold text-gray-700 truncate leading-tight">{item.nombre}</p>
                                <p className="text-xs text-manto-orange font-medium mt-1">
                                  {formatCurrency(item.precio)}
                                </p>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 bg-gray-50 rounded-md px-1 py-0.5 border border-gray-100">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-6 h-6 flex items-center justify-center text-manto-teal hover:text-manto-orange hover:bg-white rounded transition-colors disabled:opacity-30"
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="text-xs font-bold text-gray-700 w-4 text-center">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-6 h-6 flex items-center justify-center text-manto-teal hover:text-manto-orange hover:bg-white rounded transition-colors"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>

                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                                  title="Eliminar"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Footer Cart */}
                    {cart.length > 0 && (
                      <div className="p-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-gray-600">Total estimado:</span>
                          <span className="text-xl font-black text-manto-teal">{formatCurrency(totalPrice)}</span>
                        </div>

                        <Link
                          href="/cart"
                          onClick={() => setIsCartOpen(false)}
                          className="w-full bg-manto-teal text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-manto-teal/90 transition-colors shadow-lg shadow-manto-teal/20"
                        >
                          Ir al Carrito <ArrowRight size={16} />
                        </Link>
                      </div>
                    )}

                  </div>
                </>
              )}
            </div>

            {/* 👇 NUEVO: Botón Hamburguesa que alterna entre el icono Menu y X */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden hover:text-manto-orange transition-colors focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>
        </div>
      </div>

      {/* 👇 NUEVO: Menú Desplegable para Celulares */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-manto-teal/5 shadow-xl absolute w-full left-0 animate-in slide-in-from-top-2">
          <div className="flex flex-col px-6 py-6 space-y-6">

            {isAdminState && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex bg-black text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors items-center gap-2 w-fit"
              >
                <LayoutDashboard size={18} />
                Panel Admin
              </Link>
            )}

            <div className="flex flex-col space-y-4 border-b border-gray-100 pb-6">
              <Link href="/#productos" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:text-manto-orange font-bold text-lg">
                Nuestros Productos
              </Link>
              <Link href="/#historia" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:text-manto-orange font-bold text-lg">
                Que nos Diferencia?
              </Link>
              <Link href="/#contacto" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 hover:text-manto-orange font-bold text-lg">
                Contacto
              </Link>
            </div>

            {/* Agregamos el enlace a Mi Cuenta / Cerrar Sesión directamente acá para móviles */}
            <div className="flex flex-col space-y-4 pt-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tu Cuenta</p>
              <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-700 hover:text-manto-teal font-bold">
                <User size={20} />
                Mi Perfil
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                }}
                disabled={loading}
                className="flex items-center gap-3 text-red-500 hover:text-red-600 font-bold text-left"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <LogOut size={20} />}
                Cerrar Sesión
              </button>
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}