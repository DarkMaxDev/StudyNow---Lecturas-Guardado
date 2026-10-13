"use client";
import { useEffect, useState } from "react";
export default function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const n = !dark; setDark(n);
    document.documentElement.classList.toggle("dark", n);
    try { localStorage.setItem("theme", n ? "dark" : "light"); } catch {}
  };
  return <button className="btn-ghost" aria-label="Cambiar tema" onClick={toggle}>{dark ? "☀️ Claro" : "🌙 Oscuro"}</button>;
}
