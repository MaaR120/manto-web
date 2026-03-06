"use client";

import { useState } from "react";
import { Item } from "@/types";
import { Edit2, Plus, Search, Package, X, Loader2 } from "lucide-react";
// 👇 Importamos la nueva acción
import { toggleProductActiveAction, saveProductAction } from "@/actions/inventory-actions";
import { formatCurrency } from "@/utils/format";

interface Categoria {
  id: number;
  nombre: string;
}

interface Props {
  productosIniciales: Item[];
  categorias: Categoria[];
}

export default function InventoryManager({ productosIniciales, categorias }: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // Bloqueamos la UI mientras se cambia el switch para evitar doble clics
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Item>>({});

  const productosFiltrados = productosIniciales.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.id.toString().includes(busqueda)
  );

  const openModal = (producto?: Item) => {
    if (producto) {
      setFormData(producto);
    } else {
      setFormData({ nombre: '', descripcion: '', precio: 0, precio_puntos: 0, stock: 0, imagen_url: '', tipo_item_id: 1 });
    }
    setIsModalOpen(true);
  };

  // 👇 NUEVA FUNCIÓN: Maneja el Switch
  const handleToggleActive = async (id: number, estadoActual: boolean) => {
    setTogglingId(id);
    const nuevoEstado = !estadoActual; // Si estaba true, pasa a false y viceversa

    const res = await toggleProductActiveAction(id, nuevoEstado);
    if (!res.success) {
      alert("Error al cambiar el estado: " + res.message);
    }
    setTogglingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await saveProductAction(formData);
    if (res.success) {
      setIsModalOpen(false);
    } else {
      alert("Error al guardar: " + res.message);
    }
    setLoading(false);
  };

  const getCategoriaNombre = (id: number | null | undefined) => {
    if (!id) return 'Sin categoría';
    const cat = categorias.find(c => c.id === id);
    return cat ? cat.nombre : 'Otro';
  };

  return (
    <div className="space-y-6">
      {/* Barra de Herramientas */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-manto-teal focus:ring-1 focus:ring-manto-teal transition-all"
          />
        </div>
        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto bg-manto-teal text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-teal-800 transition-colors shadow-lg shadow-teal-900/20"
        >
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {/* Tabla de Productos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-bold tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Categoría</th>
                <th className="px-6 py-4 text-right">Precio</th>
                <th className="px-6 py-4 text-right">Puntos</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4 text-center">Estado / Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {productosFiltrados.map((prod) => {
                // Asumimos que si 'activo' es undefined, es true. 
                const isActivo = prod.activo ?? true;

                return (
                  // 👇 Le bajamos la opacidad si está desactivado
                  <tr key={prod.id} className={`transition-colors ${isActivo ? 'hover:bg-gray-50/50' : 'bg-gray-50/30 opacity-60 grayscale-[30%]'}`}>
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">#{prod.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden relative">
                          {prod.imagen_url ? (
                            <img src={prod.imagen_url} alt={prod.nombre} className="object-cover w-full h-full" />
                          ) : <Package size={20} className="text-gray-400" />}
                        </div>
                        <div>
                          <span className="font-bold text-gray-800 block">{prod.nombre}</span>
                          {!isActivo && <span className="text-[10px] font-bold text-red-500 uppercase">Pausado</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                        {getCategoriaNombre(prod.tipo_item_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-manto-teal">{formatCurrency(prod.precio)}</td>
                    <td className="px-6 py-4 text-right font-bold text-manto-orange">{prod.precio_puntos ? `${prod.precio_puntos} pts` : '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${prod.stock > 5 ? 'bg-green-100 text-green-700' : prod.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {prod.stock} un.
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-4">

                        {/* 👇 EL SWITCH ANIMADO */}
                        <button
                          onClick={() => handleToggleActive(prod.id, isActivo)}
                          disabled={togglingId === prod.id}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${isActivo ? 'bg-manto-teal' : 'bg-gray-300'
                            }`}
                          title={isActivo ? "Pausar producto" : "Activar producto"}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActivo ? 'translate-x-5' : 'translate-x-0'
                              }`}
                          />
                        </button>

                        <div className="w-px h-6 bg-gray-200"></div>

                        {/* Botón Editar */}
                        <button onClick={() => openModal(prod)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ABM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800">
                {formData.id ? `Editar Producto #${formData.id}` : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="abm-form" onSubmit={handleSubmit} className="space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Nombre</label>
                    <input required type="text" value={formData.nombre || ''} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-manto-teal" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Categoría</label>
                    <select
                      required
                      value={formData.tipo_item_id || ''}
                      onChange={(e) => setFormData({ ...formData, tipo_item_id: Number(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-manto-teal text-gray-700 appearance-none"
                    >
                      <option value="" disabled>Seleccionar categoría...</option>
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Precio ($)</label>
                    <input required type="number" value={formData.precio || ''} onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-manto-teal" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Precio (Puntos)</label>
                    <input type="number" value={formData.precio_puntos || ''} onChange={(e) => setFormData({ ...formData, precio_puntos: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-manto-orange" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Stock Actual</label>
                    <input required type="number" value={formData.stock || ''} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-manto-teal" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">URL de la Imagen</label>
                  <input type="text" value={formData.imagen_url || ''} onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })} placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-manto-teal" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Descripción</label>
                  <textarea rows={3} value={formData.descripcion || ''} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-manto-teal resize-none" />
                </div>

              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button onClick={() => setIsModalOpen(false)} type="button" className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-200 rounded-xl transition-colors">
                Cancelar
              </button>
              <button form="abm-form" type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-bold text-white bg-manto-teal hover:bg-teal-800 rounded-xl transition-colors flex items-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                Guardar Producto
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}