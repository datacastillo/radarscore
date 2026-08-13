import { createClient } from '@supabase/supabase-js';

// Usamos las variables de entorno, y en caso de no estar definidas durante el build de Vercel,
// asignamos un valor por defecto para evitar que la compilación se rompa con "supabaseUrl is required".
const supabaseUrl = 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dkexdxmgkdzoovksuqms.supabase.co';

const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_anon_key';

// 🔍 Diagnóstico temporal: imprime la URL detectada en la consola del navegador
if (typeof window !== 'undefined') {
  console.log('👉 URL de Supabase detectada:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);