import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY;

let supabase = null;
let isSupabaseActive = false;

if (
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL !== "YOUR_SUPABASE_URL_HERE" && 
  SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY_HERE"
) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    isSupabaseActive = true;
    console.log("Supabase client initialized successfully!");
  } catch (e) {
    console.error("Failed to initialize Supabase client:", e);
  }
}

export { supabase, isSupabaseActive };
