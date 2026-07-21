import { createClient } from "@supabase/supabase-js";

// Progetto Supabase del portfolio.
// La chiave "publishable" (anon) è pubblica per definizione: è pensata per stare
// nel frontend ed è protetta dalle policy RLS lato database.
const URL = import.meta.env.VITE_SUPABASE_URL || "https://czjfkthjrtvbzcoxvyeo.supabase.co";
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const hasLeaderboard = Boolean(URL && KEY);
export const supabase = hasLeaderboard ? createClient(URL, KEY) : null;
