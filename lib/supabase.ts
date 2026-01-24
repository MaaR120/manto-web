// src/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Usamos createBrowserClient para que la sesión se guarde en COOKIES
// y no en LocalStorage. Así el servidor podrá leerla.
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);