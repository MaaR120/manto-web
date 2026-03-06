// lib/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

// Usamos la Service Role Key para saltarnos el RLS (SOLO USAR EN EL BACKEND)
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // ¡Asegurate de tener esta variable en tu .env.local!
);