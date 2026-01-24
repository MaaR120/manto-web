// app/(admin)/layout.tsx
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* SIDEBAR (Menú lateral exclusivo de Admin) */}
      <aside className="w-64 bg-manto-teal text-white p-6 hidden md:block">
        <h2 className="text-2xl font-bold mb-8">MANTO <span className="text-manto-orange">Admin</span></h2>
        <nav className="space-y-4">
          <Link href="/admin" className="block p-2 hover:bg-white/10 rounded">Resumen</Link>
          <Link href="/admin/ventas" className="block p-2 hover:bg-white/10 rounded">Ventas</Link>
          <Link href="/admin/clientes" className="block p-2 hover:bg-white/10 rounded">Clientes (CRM)</Link>
        </nav>
      </aside>

      {/* Contenido Principal del Admin */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}