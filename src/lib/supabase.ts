import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Si faltan las variables de entorno, preferimos que el build/runtime falle
// con un mensaje claro en vez de conectarnos silenciosamente con un placeholder
// inválido (eso generaría errores confusos e intermitentes en producción).
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Faltan las variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY). ' +
    'Verifica que estén configuradas en Vercel (Settings → Environment Variables) para este ambiente (Production/Preview/Development).'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);