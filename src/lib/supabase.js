import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || "https://jfnwhewmwdiirjoqhzsd.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmbndoZXdtd2RpaXJqb3FoenNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMTQxOTksImV4cCI6MjA5NTg5MDE5OX0.hPEhxr-p1-LTLdomKSjLr_dp1N3jgX06jagxLDEZqd0";

let supabase = null;
let isSupabaseActive = false;

if (
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL !== "YOUR_SUPABASE_URL_HERE" && 
  SUPABASE_ANON_KEY !== "YOUR_SUPABASE_ANON_KEY_HERE"
) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    isSupabaseActive = true;
    console.log("Supabase client initialized successfully!");
  } catch (e) {
    console.error("Failed to initialize Supabase client:", e);
  }
}

export { supabase, isSupabaseActive };
