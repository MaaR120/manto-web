"use client";
import { useState } from 'react';
import { User, MapPin, Edit2, Save, X, Loader2, Home, Building } from "lucide-react";
import { useRouter } from 'next/navigation';
import { dashboardService } from '@/services/dashboardService';

// Definimos la estructura exacta de la dirección
interface AddressData {
  calle: string;
  altura: string;
  piso?: string;
  cp: string;
  ciudad: string;
  provincia: string;
}

interface UserData {
  id: number;
  nombre: string;
  email: string;
  // Ahora direccion es un Objeto, o null si no tiene
  direccion: AddressData | null;
}

interface Props {
  initialData: UserData;
}

export function ProfileCard({ initialData }: Props) {
  const [user, setUser] = useState<UserData>(initialData);
  
  // Estado temporal para el formulario (para poder cancelar cambios)
  const [formData, setFormData] = useState<UserData>(initialData);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Helper para mostrar la dirección en una sola línea bonita
  const getFormattedAddress = (dir: AddressData | null) => {
    if (!dir || !dir.calle) return "Sin dirección definida";
    const pisoStr = dir.piso ? ` (Piso ${dir.piso})` : '';
    return `${dir.calle} ${dir.altura}${pisoStr}, ${dir.ciudad}, ${dir.provincia} - CP ${dir.cp}`;
  };

  // 1. Maneja cambios en datos simples (Nombre)
  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 2. Maneja cambios en la dirección anidada
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      direccion: {
        ...prev.direccion!, // Asumimos que si edita es porque inicializamos el objeto
        [name]: value
      }
    }));
  };

  const handleEditClick = () => {
    // Si el usuario no tiene dirección, inicializamos un objeto vacío para que los inputs funcionen
    if (!formData.direccion) {
      setFormData({
        ...formData,
        direccion: { calle: '', altura: '', piso: '', cp: '', ciudad: '', provincia: 'Mendoza' }
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Enviamos el objeto completo al servicio
      await dashboardService.actualizarPerfil(user.id, {
        nombre: formData.nombre,
        direccion: formData.direccion // El backend se encargará de guardar en la tabla direccion_cliente
      });
      
      setUser(formData); // Actualizamos la vista local
      setIsEditing(false);
      router.refresh(); 
      alert("¡Perfil actualizado con éxito!"); // O un Toast mejor
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(user); // Revertimos al estado original
    setIsEditing(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-manto-teal/10 shadow-lg relative transition-all duration-300 hover:shadow-xl">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-manto-teal flex items-center gap-2">
          <User className="text-manto-orange" size={24} /> Mis Datos Personales
        </h2>
        {isEditing && (
             <span className="text-[10px] font-black tracking-widest text-manto-teal bg-manto-teal/10 px-2 py-1 rounded uppercase animate-pulse">
                Modo Edición
             </span>
        )}
      </div>

      <div className="space-y-6">
        
        {/* --- NOMBRE --- */}
        <div>
          <label className="text-xs uppercase text-gray-400 font-bold block mb-1">Nombre Completo</label>
          {isEditing ? (
            <input 
              name="nombre" 
              value={formData.nombre} 
              onChange={handleBasicChange} 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:border-manto-teal focus:ring-2 focus:ring-manto-teal/10 transition-all" 
              placeholder="Tu nombre"
            />
          ) : (
            <p className="text-gray-800 font-bold text-lg">{user.nombre}</p>
          )}
        </div>

        {/* --- EMAIL --- */}
        <div>
          <label className="text-xs uppercase text-gray-400 font-bold block mb-1">Correo Electrónico</label>
          <div className="flex justify-between items-center">
             <p className="text-gray-600 font-medium">{user.email}</p>
             <span className="text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded">No editable</span>
          </div>
        </div>

        {/* --- DIRECCIÓN (La parte compleja) --- */}
        <div>
          <label className="text-xs uppercase text-gray-400 font-bold block mb-2 flex items-center gap-1">
             <MapPin size={12}/> Dirección de Envío
          </label>
          
          {isEditing ? (
            /* FORMULARIO DE DIRECCIÓN */
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3 animate-in fade-in slide-in-from-top-2">
                
                {/* Calle y Altura */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                        <input name="calle" placeholder="Calle" value={formData.direccion?.calle} onChange={handleAddressChange} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:border-manto-teal outline-none" />
                    </div>
                    <div>
                        <input name="altura" placeholder="Altura" value={formData.direccion?.altura} onChange={handleAddressChange} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:border-manto-teal outline-none" />
                    </div>
                </div>

                {/* Piso, CP */}
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <input name="piso" placeholder="Piso/Depto" value={formData.direccion?.piso || ''} onChange={handleAddressChange} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:border-manto-teal outline-none" />
                    </div>
                    <div>
                        <input name="cp" placeholder="CP" value={formData.direccion?.cp} onChange={handleAddressChange} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:border-manto-teal outline-none" />
                    </div>
                    <div>
                         {/* Select simple de provincia */}
                         <select name="provincia" value={formData.direccion?.provincia} onChange={handleAddressChange} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:border-manto-teal outline-none">
                            <option value="Mendoza">Mendoza</option>
                            <option value="Buenos Aires">Bs As</option>
                            <option value="Cordoba">Córdoba</option>
                            {/* ... más provincias */}
                         </select>
                    </div>
                </div>

                {/* Ciudad */}
                <div>
                    <input name="ciudad" placeholder="Ciudad" value={formData.direccion?.ciudad} onChange={handleAddressChange} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm focus:border-manto-teal outline-none" />
                </div>
            </div>
          ) : (
            /* VISTA DE DIRECCIÓN */
            <div className="flex items-start gap-3 p-3 rounded-xl bg-manto-teal/5 border border-manto-teal/10">
               <div className="bg-white p-2 rounded-full shadow-sm text-manto-orange">
                 <Home size={18} />
               </div>
               <div>
                 <p className="text-gray-800 font-medium leading-tight">
                    {user.direccion?.calle ? (
                        <>
                            {user.direccion.calle} {user.direccion.altura}
                            {user.direccion.piso && <span className="text-gray-500 text-sm"> ({user.direccion.piso})</span>}
                        </>
                    ) : "Sin dirección guardada"}
                 </p>
                 <p className="text-sm text-gray-500 mt-1">
                    {user.direccion?.ciudad ? `${user.direccion.ciudad}, ${user.direccion.provincia} (CP: ${user.direccion.cp})` : "Completa tus datos para recibir envíos."}
                 </p>
               </div>
            </div>
          )}
        </div>

        {/* --- BOTONES --- */}
        <div className="pt-2 flex gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex-1 bg-manto-teal text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-manto-teal/90 disabled:opacity-70 transition-all shadow-md hover:shadow-lg"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Guardar Cambios
              </button>
              
              <button 
                onClick={handleCancel} 
                disabled={isSaving}
                className="px-5 border-2 border-gray-200 text-gray-500 rounded-xl hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <button 
              onClick={handleEditClick} 
              className="w-full text-sm font-bold text-gray-600 border-2 border-gray-100 py-3 rounded-xl hover:border-manto-teal hover:text-manto-teal transition-all flex items-center justify-center gap-2 group"
            >
              <Edit2 size={16} className="text-gray-400 group-hover:text-manto-teal transition-colors"/> 
              Editar información
            </button>
          )}
        </div>
      </div>
    </div>
  );
}