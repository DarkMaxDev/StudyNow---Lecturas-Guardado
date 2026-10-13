"use client";
import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

export default function Nav({ admin }: { admin: boolean }) {
  const [open, setOpen] = useState(false);
  const [bg, setBg] = useState("");
  const [msg, setMsg] = useState("");

  async function toggle() {
    setOpen(!open);
    if (!open) { const d = await fetch("/api/me").then((r) => r.json()).catch(() => null); setBg(d?.bgUrl ?? ""); }
  }
  async function save(value: string) {
    const r = await fetch("/api/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bgUrl: value }) });
    const d = await r.json();
    if (!r.ok) return setMsg(d.error);
    setBg(d.bgUrl); setMsg(d.bgUrl ? "Fondo aplicado" : "Fondo quitado");
    window.dispatchEvent(new CustomEvent("pdfhub:bg", { detail: d.bgUrl }));
  }

  return (
    <header className="relative z-20 flex flex-wrap items-center justify-between gap-2 border-b border-mist/10 bg-panel px-4 py-3 sm:px-8">
      <Link href="/dashboard" className="grad-text text-xl font-extrabold">StudyNow - Lecturas & Guardado</Link>
      <nav className="flex flex-wrap items-center gap-2">
        {admin && <Link href="/admin" className="btn-ghost">Administración</Link>}
        <button className="btn-ghost" onClick={toggle} aria-expanded={open}>🖼️ Fondo</button>
        <ThemeToggle />
        <button className="btn-ghost" onClick={() => signOut({ callbackUrl: "/login" })}>Salir</button>
      </nav>
      <AnimatePresence>{open && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute right-4 top-full mt-2 w-[min(22rem,calc(100vw-2rem))] space-y-2 rounded-2xl bg-panel p-4 shadow-2xl ring-1 ring-mist/15">
          <label className="text-sm font-semibold" htmlFor="bg">Imagen de fondo (enlace)</label>
          <input id="bg" className="input" placeholder="https://…/imagen.jpg" value={bg} onChange={(e) => setBg(e.target.value)} />
          <div className="flex gap-2"><button className="btn" onClick={() => save(bg.trim())}>Aplicar</button><button className="btn-ghost" onClick={() => save("")}>Quitar</button></div>
          {msg && <p role="status" className="text-xs opacity-80">{msg}</p>}
        </motion.div>
      )}</AnimatePresence>
    </header>
  );
}
