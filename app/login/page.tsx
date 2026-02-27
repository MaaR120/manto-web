"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Mail, Lock, User, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  
  // Estado para alternar entre Login y Registro
  const [isRegister, setIsRegister] = useState(false);
  
  // Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para visibilidad de contraseñas
  const [showPassword, setShowPassword] = useState(false);

  // Campos del formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Nuevo campo

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Declaramos la variable user fuera de los bloques para poder usarla al final
    let user = null; 

    try {
      if (isRegister) {
        // --- VALIDACIÓN EXTRA PARA REGISTRO ---
        if (password !== confirmPassword) {
            throw new Error("Las contraseñas no coinciden.");
        }

        // 1. Crear usuario en Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: nombre } }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("No se pudo crear el usuario.");
        
        // Asignamos el usuario registrado a la variable externa
        user = authData.user; 

        // 2. Crear ficha en la tabla 'cliente'
        const { error: dbError } = await supabase.from('cliente').insert({
          nombre: nombre,
          email: email,
          direccion: "Sin dirección",
          etiqueta: "Matero Iniciado",
          puntos_acumulados: 0
        });
        
        if (dbError) throw dbError;

      } else {
        // --- MODO LOGIN ---
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (loginError) throw loginError;
        
        // Asignamos el usuario logueado a la variable externa
        user = data.user;
      }

      // --- LÓGICA DE REDIRECCIÓN (Ahora 'user' sí existe aquí) ---
      if (user){
        const {data: usuarioDb} = await supabase
        .from("cliente") // O "usuarios", como hayas decidido llamarla
        .select("rol")
        .eq('id_auth', user.id)
        .single();

        if (usuarioDb?.rol === 'admin') {
          console.log("👑 Bienvenido Jefe. Redirigiendo a /admin");
          router.refresh(); 
          router.push('/admin'); 
        } else {
          console.log("👋 Bienvenido Cliente. Redirigiendo a la tienda");
          router.refresh();
          router.push('/'); 
        }
      }

    } catch (error) {
      let mensaje = "Ocurrió un error inesperado.";
      if (error instanceof Error) {
        mensaje = error.message;
      }
      setError(mensaje);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-manto-bg flex items-center justify-center p-4">
      <div className="bg-white/50 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-manto-teal/10 shadow-xl w-full max-w-md relative overflow-hidden transition-all">
        
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-manto-teal/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-manto-orange/10 rounded-full -ml-10 -mb-10 blur-xl"></div>

        <div className="relative z-10 text-center mb-8">
            <span className="text-4xl mb-2 block animate-bounce">{isRegister ? "🌱" : "🧉"}</span>
            <h1 className="text-3xl font-bold text-manto-teal">
              {isRegister ? "Crear Cuenta" : "Bienvenido"}
            </h1>
            <p className="text-gray-500 mt-2">
              {isRegister ? "Únete al club del buen mate" : "Ingresa a tu espacio matero"}
            </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4 relative z-10">
          
          {/* Nombre (Solo visible en Registro) */}
          {isRegister && (
            <div className="space-y-1 text-left animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold text-manto-teal uppercase ml-1">Nombre</label>
              <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-manto-teal focus:ring-2 focus:ring-manto-teal/20 transition-all"
                    placeholder="Tu nombre"
                    required={isRegister}
                  />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-manto-teal uppercase ml-1">Email</label>
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-manto-teal focus:ring-2 focus:ring-manto-teal/20 transition-all"
                  placeholder="hola@ejemplo.com"
                  required
                />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-bold text-manto-teal uppercase ml-1">Contraseña</label>
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} // <--- Aquí cambia el tipo
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-12 outline-none focus:border-manto-teal focus:ring-2 focus:ring-manto-teal/20 transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                {/* Botón del Ojo */}
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-manto-teal transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
          </div>

          {/* Confirm Password (Solo visible en Registro) */}
          {isRegister && (
            <div className="space-y-1 text-left animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-xs font-bold text-manto-teal uppercase ml-1">Repetir Contraseña</label>
              <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} // Usa el mismo estado para mostrar ambas
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-12 outline-none focus:border-manto-teal focus:ring-2 focus:ring-manto-teal/20 transition-all"
                    placeholder="••••••••"
                    required={isRegister}
                    minLength={6}
                  />
                  {/* Botón del Ojo (También aquí) */}
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-manto-teal transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg border border-red-100 font-medium flex items-center gap-2 animate-in fade-in">
                <AlertCircle size={16} /> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-manto-teal text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-6"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>{isRegister ? "Registrarme" : "Ingresar"} <ArrowRight size={18} /></>}
          </button>

          {/* Toggle de Modo */}
          <div className="text-center mt-6">
            <button 
                type="button"
                onClick={() => { 
                    setIsRegister(!isRegister); 
                    setError(null);
                    setNombre("");
                    setConfirmPassword(""); // Limpiamos la confirmación al cambiar
                }}
                className="text-sm text-gray-500 hover:text-manto-teal transition-colors"
            >
              {isRegister ? (
                  <>¿Ya tienes cuenta? <span className="text-manto-orange font-bold underline cursor-pointer">Inicia Sesión</span></>
              ) : (
                  <>¿Eres nuevo? <span className="text-manto-orange font-bold underline cursor-pointer">Créate una cuenta</span></>
              )}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}