// Registro esplicito delle icone usate dinamicamente (dai dati),
// così Vite fa tree-shaking e non include l'intera libreria lucide.
import {
  Trophy, Bot, Sprout, Layout, Database, Sparkles, Boxes,
  Terminal, Container, Cpu, Users, Circle, Cloud, ScrollText, Palette,
} from "lucide-react";

const MAP = {
  Trophy, Bot, Sprout, Layout, Database, Sparkles, Boxes,
  Terminal, Container, Cpu, Users, Cloud, ScrollText, Palette,
};

export default function Icon({ name, className }) {
  const C = MAP[name] || Circle;
  return <C className={className} />;
}
