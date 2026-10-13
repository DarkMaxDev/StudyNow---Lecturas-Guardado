"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Row = { _id: string; nombre: string; email: string; role: string; pdfLimit: number; count: number };

export default function AdminPanel() {
  const [data, setData] = useState<{ users: Row[]; totalUsers: number; totalLinks: number } | null>(null);
  const [msg, setMsg] = useState("");
  useEffect(() => { fetch("/api/admin/users").then((r) => r.json()).then((d) => (d.error ? setMsg(d.error) : setData(d))); }, []);

  async function change(id: string, delta: number) {
    const r = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, delta }) });
    const d = await r.json();
    if (!r.ok) return setMsg(d.error);
    setData((p) => p && { ...p, users: p.users.map((u) => (u._id === id ? { ...u, pdfLimit: d.pdfLimit } : u)) });
  }

  if (msg) return <p role="alert" className="p-8">{msg}</p>;
  if (!data) return <p className="p-8 opacity-70">Cargando…</p>;
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
      <h1 className="text-2xl font-bold">Administración</h1>
      <div className="grid grid-cols-2 gap-3">
        {[["Usuarios registrados", data.totalUsers], ["PDFs en la plataforma", data.totalLinks]].map(([l, v]) => (
          <motion.div key={l} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl bg-panel p-4"><p className="text-3xl font-bold text-teal">{v}</p><p className="text-sm text-mist/70">{l}</p></motion.div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl bg-panel">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-mist/60"><tr><th className="p-3">Usuario</th><th>PDFs guardados</th><th>Límite</th><th className="pr-3 text-right">Ajustar límite</th></tr></thead>
          <tbody>{data.users.map((u) => (
            <tr key={u._id} className="border-t border-mist/10">
              <td className="p-3"><p className="font-medium">{u.nombre}{u.role === "admin" && " (admin)"}</p><p className="text-mist/60">{u.email}</p></td>
              <td className="tabular-nums">{u.count}</td>
              <td className={`tabular-nums ${u.count >= u.pdfLimit ? "text-red-300" : ""}`}>{u.pdfLimit}</td>
              <td className="pr-3"><div className="flex justify-end gap-1">
                <button className="btn-ghost" aria-label={`Reducir límite de ${u.email}`} onClick={() => change(u._id, -1)}>−</button>
                <button className="btn-ghost" aria-label={`Aumentar límite de ${u.email}`} onClick={() => change(u._id, 1)}>+</button>
                <button className="btn-ghost" onClick={() => change(u._id, 5)}>+5</button>
              </div></td>
            </tr>))}</tbody>
        </table>
      </div>
    </main>
  );
}
