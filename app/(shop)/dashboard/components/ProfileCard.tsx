"use client";
import { useState } from 'react';
import { User, MapPin, Edit2, Save, X, Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation'; // Importante para refrescar caché
import { dashboardService } from '@/services/dashboardService'; // Importamos el servicio

interface Props {
  initialData: {
    id: number;
    nombre: string;
    email: string;
    direccion: string;
  };
}

export function ProfileCard({ initialData }: Props) {
  const [user, setUser] = useState(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Llamamos a nuestro servicio
      await dashboardService.actualizarPerfil(user.id, {
        nombre: user.nombre,
        direccion: user.direccion
      });
      setIsEditing(false);
      router.refresh(); // Actualiza los datos del servidor en segundo plano
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("No se pudieron guardar los cambios. Intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setUser(initialData); // Revertimos cambios
    setIsEditing(false);
  };

  return (
    <div className="bg-white/50 backdrop-blur-md p-8 rounded-3xl border border-manto-teal/10 shadow-sm relative transition-all duration-300">
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-manto-teal flex items-center gap-2">
          <User size={20} /> Mis Datos
        </h2>
        {isEditing && <span className="text-xs font-bold text-manto-orange animate-pulse">EDITANDO</span>}
      </div>

      <div className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="text-xs uppercase text-manto-teal/50 font-bold block mb-1">Nombre</label>
          {isEditing ? (
            <input 
              name="nombre" 
              value={user.nombre} 
              onChange={handleChange} 
              className="w-full bg-white border-2 border-manto-orange/50 rounded-lg px-3 py-2 text-manto-text focus:outline-none focus:border-manto-orange transition-colors" 
            />
          ) : (
            <p className="text-manto-text font-medium text-lg border-b border-transparent py-2">{user.nombre}</p>
          )}
        </div>

        {/* Email (Solo lectura) */}
        <div>
          <label className="text-xs uppercase text-manto-teal/50 font-bold block mb-1">Email</label>
          <p className="text-manto-text font-medium border-b border-transparent py-2 opacity-70 cursor-not-allowed" title="No puedes cambiar tu email">
            {user.email}
          </p>
        </div>

        {/* Dirección */}
        <div>
          <label className="text-xs uppercase text-manto-teal/50 font-bold block mb-1">Dirección Principal</label>
          <div className="flex items-start gap-2 mt-1 text-manto-text">
             <MapPin size={16} className={`mt-2 ${isEditing ? 'text-gray-400' : 'text-manto-orange'}`} />
             {isEditing ? (
                <input 
                  name="direccion" 
                  value={user.direccion} 
                  onChange={handleChange} 
                  className="w-full bg-white border-2 border-manto-orange/50 rounded-lg px-3 py-2 text-manto-text focus:outline-none focus:border-manto-orange transition-colors" 
                />
             ) : (
                <p className="py-2">{user.direccion || "Sin dirección definida"}</p>
             )}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="pt-4 flex gap-2">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex-1 bg-manto-teal text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-manto-teal/90 disabled:opacity-70 transition-all"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {isSaving ? "Guardando..." : "Guardar"}
              </button>
              
              <button 
                onClick={handleCancel} 
                disabled={isSaving}
                className="px-4 border-2 border-red-200 text-red-400 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="w-full text-sm font-bold text-manto-teal border border-manto-teal/30 py-2 rounded-xl hover:bg-manto-teal hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <Edit2 size={16} /> Editar Perfil
            </button>
          )}
        </div>
      </div>
    </div>
  );
}