import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Initialization
 * 
 * Initializes the Supabase client using environment variables.
 * @requires VITE_SUPABASE_URL - The URL of your Supabase project.
 * @requires VITE_SUPABASE_ANON_KEY - The anonymous public key for your Supabase project.
 * 
 * @see https://supabase.com/docs/reference/javascript/initializing
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase credentials. Application will not function correctly.');
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);
