import { getUser } from "@/lib/auth";

const PRIVATE = /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[|.*\.local$|.*\.internal$)/i;
const MAX = 30 * 1024 * 1024;

// Descarga el PDF en el servidor para evitar bloqueos CORS del origen externo.
export async function GET(req: Request) {
  if (!(await getUser())) return new Response("No autorizado", { status: 401 });
  let t: URL;
  try { t = new URL(new URL(req.url).searchParams.get("url") ?? ""); } catch { return new Response("URL inválida", { status: 400 }); }
  if (!/^https?:$/.test(t.protocol) || PRIVATE.test(t.hostname)) return new Response("URL no permitida", { status: 400 });
  const r = await fetch(t, { signal: AbortSignal.timeout(20000) }).catch(() => null);
  if (!r?.ok || !r.body) return new Response("No se pudo descargar el PDF", { status: 502 });
  if (Number(r.headers.get("content-length") ?? 0) > MAX) return new Response("PDF demasiado grande", { status: 413 });
  return new Response(r.body, { headers: { "content-type": "application/pdf", "cache-control": "private, max-age=300" } });
}
