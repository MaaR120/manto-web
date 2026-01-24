// middleware.ts
import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function proxy(request: NextRequest) {
  // Esta función actualiza la cookie de sesión para que no caduque
  // y para que el servidor la pueda leer correctamente.
  return await updateSession(request);
}

export const config = {
  // Configuración para que el middleware corra en casi todas las rutas
  // excepto archivos estáticos, imágenes, favicon, etc.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};