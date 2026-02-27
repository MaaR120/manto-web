// components/AdminFloatingButton.tsx
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export default function AdminFloatingButton() {
  // Nota: Este componente asume que ya verificaste que es admin antes de renderizarlo
  return (
    <Link 
      href="/admin"
      className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-[9999] flex items-center gap-2 border-2 border-white"
      title="Volver al Panel de Admin"
    >
      <LayoutDashboard size={24} />
      <span className="font-bold pr-2">Admin</span>
    </Link>
  );
}