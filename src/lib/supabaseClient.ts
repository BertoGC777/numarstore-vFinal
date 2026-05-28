import { createClient } from '@supabase/supabase-js';

// Cliente Supabase (frontend)
// Configurado com variáveis públicas do ambiente (Vite usa prefixo VITE_)
// A service_role key nunca entra neste arquivo — ela é usada apenas nas Edge Functions
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
