import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured =
  Boolean(rawUrl && rawKey) &&
  rawUrl.startsWith('http') &&
  !rawUrl.includes('YOUR_SUPABASE_URL');

// Si aún no se han configurado las variables de entorno en Vercel/.env,
// usamos una URL sintácticamente válida para evitar errores de inicialización
// y que la web funcione al 100% con los datos semilla locales (FALLBACK_CONFIG).
const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder-project.supabase.co';
const supabaseAnonKey = isSupabaseConfigured ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: isSupabaseConfigured,
  },
});
