import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 🔍 Diagnóstico temporal: imprime la URL detectada en la consola del navegador
if (typeof window !== 'undefined') {
  console.log('👉 URL de Supabase detectada:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);