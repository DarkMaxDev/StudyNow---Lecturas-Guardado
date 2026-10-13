"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const STRIPES = [
  "from-cyan-400 to-blue-500 dark:from-white dark:to-neutral-500",
  "from-fuchsia-500 to-pink-500 dark:from-neutral-200 dark:to-neutral-600",
  "from-amber-400 to-orange-500 dark:from-neutral-300 dark:to-neutral-700",
  "from-emerald-400 to-teal-500 dark:from-neutral-100 dark:to-neutral-400",
];
type Col = { _id: string; title: string };
type Lnk = { _id: string; title: string; url: string; collectionId: string };

async function api(url: string, method = "GET", body?: unknown) {
  const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error ?? "Error inesperado");
  return d;
}

export default function Collections() {
  const [cols, setCols] = useState<Col[]>([]);
  const [links, setLinks] = useState<Lnk[]>([]);
  const [limit, setLimit] = useState(0);
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [f, setF] = useState({ title: "", url: "" });
  const [edit, setEdit] = useState<{ id: string; t: string } | null>(null);

  const load = useCallback(async () => { const d = await api("/api/collections"); setCols(d.collections); setLinks(d.links); setLimit(d.limit); }, []);
  useEffect(() => { load().catch((e) => setMsg(e.message)); }, [load]);
  const run = (fn: () => Promise<unknown>) => fn().then(load).then(() => setMsg("")).catch((e) => setMsg(e.message));
  const full = links.length >= limit;

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-8">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="grad-text text-3xl font-extrabold">Mis colecciones</h1>
          <p className="text-sm text-mist/70">{links.length} de {limit} PDFs guardados</p></div>
        <div className="h-2 w-full overflow-hidden rounded bg-panel sm:w-48"><motion.div className={`h-full ${full ? "bg-red-400" : "bg-teal"}`} animate={{ width: `${limit ? Math.min(100, (links.length / limit) * 100) : 100}%` }} /></div>
      </section>
      <AnimatePresence>{msg && <motion.p role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-lg bg-red-500/15 p-3 text-sm text-red-200">{msg}</motion.p>}</AnimatePresence>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (title.trim()) run(() => api("/api/collections", "POST", { title })).then(() => setTitle("")); }}>
        <input className="input" placeholder="Nombre de la nueva colección" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="btn whitespace-nowrap">Crear</button>
      </form>
      {cols.length === 0 && <p className="text-mist/70">Aún no tienes colecciones. Crea la primera para guardar PDFs.</p>}
      <div className="space-y-3">
        <AnimatePresence initial={false}>{cols.map((c, i) => {
          const items = links.filter((l) => l.collectionId === c._id);
          return (
            <motion.article layout key={c._id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} whileHover={{ y: -3 }} transition={{ delay: Math.min(i, 8) * 0.04 }} className="relative overflow-hidden rounded-2xl bg-panel p-4 pl-6 shadow-xl ring-1 ring-mist/10">
              <span className={`absolute inset-y-0 left-0 w-2 bg-gradient-to-b ${STRIPES[i % 4]}`} />
              <div className="flex flex-wrap items-center justify-between gap-2">
                {edit?.id === c._id ? (
                  <form className="flex flex-1 gap-2" onSubmit={(e) => { e.preventDefault(); if (edit.t.trim()) run(() => api(`/api/collections/${c._id}`, "PATCH", { title: edit.t })).then(() => setEdit(null)); }}>
                    <input autoFocus className="input" maxLength={80} value={edit.t} onChange={(e) => setEdit({ id: c._id, t: e.target.value })} onKeyDown={(e) => e.key === "Escape" && setEdit(null)} aria-label="Nuevo nombre de la colección" />
                    <button className="btn">Guardar</button><button type="button" className="btn-ghost" onClick={() => setEdit(null)}>Cancelar</button>
                  </form>
                ) : <button className="text-left text-lg font-semibold" aria-expanded={open === c._id} onClick={() => setOpen(open === c._id ? null : c._id)}>{c.title} <span className="text-sm font-normal text-mist/60">({items.length})</span></button>}
                <div className="flex gap-2">
                  <button className="btn-ghost" onClick={() => setEdit({ id: c._id, t: c.title })}>Renombrar</button>
                  <button className="btn-ghost" onClick={() => confirm("¿Eliminar la colección y sus PDFs?") && run(() => api(`/api/collections/${c._id}`, "DELETE"))}>Eliminar</button>
                </div>
              </div>
              <AnimatePresence initial={false}>{open === c._id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <ul className="mt-3 space-y-2">
                    {items.map((l) => (
                      <li key={l._id} className="flex items-center justify-between gap-2 rounded-lg bg-ink px-3 py-2 text-sm">
                        <Link className="truncate text-teal hover:underline" href={`/viewer?url=${encodeURIComponent(l.url)}&title=${encodeURIComponent(l.title)}`}>{l.title}</Link>
                        <button className="text-mist/60 hover:text-red-300" aria-label={`Eliminar ${l.title}`} onClick={() => run(() => api(`/api/links/${l._id}`, "DELETE"))}>✕</button>
                      </li>
                    ))}
                    {items.length === 0 && <li className="text-sm text-mist/60">Esta colección está vacía.</li>}
                  </ul>
                  <form className="mt-3 grid gap-2 sm:grid-cols-[1fr_2fr_auto]" onSubmit={(e) => { e.preventDefault(); run(() => api("/api/links", "POST", { ...f, collectionId: c._id })).then(() => setF({ title: "", url: "" })); }}>
                    <input className="input" placeholder="Título" required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
                    <input className="input" type="url" placeholder="https://sitio.com/archivo.pdf" required value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} />
                    <button className="btn" disabled={full}>{full ? "Límite alcanzado" : "Guardar PDF"}</button>
                  </form>
                </motion.div>
              )}</AnimatePresence>
            </motion.article>
          );
        })}</AnimatePresence>
      </div>
    </main>
  );
}