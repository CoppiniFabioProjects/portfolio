import { useEffect, useState } from "react";

export function useMedia(query) {
  const [match, setMatch] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, [query]);
  return match;
}

// Telefoni e tablet (o finestre strette): le sezioni a tappe diventano file da sfogliare
// di lato, e la pagina scorre in verticale in modo normale.
export const useTouchLayout = () => useMedia("(pointer: coarse), (max-width: 767px)");
