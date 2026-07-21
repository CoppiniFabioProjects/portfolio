// Progetto Supabase del portfolio.
// La chiave "publishable" (anon) è pubblica per definizione: è pensata per stare
// nel frontend ed è protetta dalle policy RLS lato database.
const URL = import.meta.env.VITE_SUPABASE_URL || "https://czjfkthjrtvbzcoxvyeo.supabase.co";
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6amZrdGhqcnR2Ynpjb3h2eWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MjQ4MjYsImV4cCI6MjEwMDIwMDgyNn0.ArkPIH7B6fU7dG2PCvijMYkP42aKOwKX-H5loEgXx_4";

export const hasLeaderboard = Boolean(URL && KEY);

// Caricamento pigro: supabase-js viene scaricato solo quando serve davvero
// (prima interazione con la classifica), non nel bundle iniziale.
let _client;
export async function getSupabase() {
  if (!hasLeaderboard) return null;
  if (!_client) {
    const { createClient } = await import("@supabase/supabase-js");
    _client = createClient(URL, KEY);
  }
  return _client;
}
