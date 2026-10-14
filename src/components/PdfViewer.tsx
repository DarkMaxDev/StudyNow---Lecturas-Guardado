"use client";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

if (typeof (Promise as any).withResolvers !== "function") {
  (Promise as any).withResolvers = function () { let resolve: any, reject: any; const promise = new Promise((a, b) => { resolve = a; reject = b; }); return { promise, resolve, reject }; };
}
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type Media = { kind: "iframe" | "audio"; p: "yt" | "sp" | "sc" | "audio"; src: string; h: number };
function toMedia(raw: string): Media | null {
  try {
    const u = new URL(raw.trim());
    if (!/^https?:$/.test(u.protocol)) return null;
    const h = u.hostname.replace(/^(www|m|music)\./, "");
    if (h === "youtu.be" || h === "youtube.com") {
      const list = u.searchParams.get("list");
      const id = h === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v") ?? u.pathname.split("/").pop() ?? "";
      if (/^[\w-]{11}$/.test(id)) return { kind: "iframe", p: "yt", h: 200, src: `https://www.youtube-nocookie.com/embed/${id}?enablejsapi=1&controls=0&autoplay=1&loop=1&${list && /^[\w-]+$/.test(list) ? `list=${list}` : `playlist=${id}`}` };
      if (list && /^[\w-]+$/.test(list)) return { kind: "iframe", p: "yt", h: 200, src: `https://www.youtube-nocookie.com/embed/videoseries?enablejsapi=1&controls=0&list=${list}&autoplay=1` };
    }
    const sp = h === "open.spotify.com" && u.pathname.match(/\/(track|album|playlist|episode|show|artist)\/(\w+)/);
    if (sp) return { kind: "iframe", p: "sp", h: /track|episode/.test(sp[1]) ? 152 : 352, src: `https://open.spotify.com/embed/${sp[1]}/${sp[2]}` };
    if (h === "soundcloud.com") return { kind: "iframe", p: "sc", h: 166, src: `https://w.soundcloud.com/player/?url=${encodeURIComponent(u.href)}&auto_play=true` };
    if (/\.(mp3|ogg|wav|m4a|aac)$/i.test(u.pathname)) return { kind: "audio", p: "audio", h: 54, src: u.href };
  } catch {}
  return null;
}

export default function PdfViewer({ url, title }: { url: string; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [w, setW] = useState(600);
  const [err, setErr] = useState("");
  const [dock, setDock] = useState(false);
  const [mIn, setMIn] = useState("");
  const [media, setMedia] = useState<Media | null>(null);
  const [mErr, setMErr] = useState("");
  const [vol, setVol] = useState(70);
  const ifr = useRef<HTMLIFrameElement>(null);
  const aud = useRef<HTMLAudioElement>(null);

  // Detectar si la URL corresponde a Google Drive
  const isGoogleDrive = /drive\.google\.com|docs\.google\.com/.test(url);
  const pdfSourceUrl = isGoogleDrive
    ? `/api/drive-proxy?url=${encodeURIComponent(url)}`
    : `/api/pdf-proxy?url=${encodeURIComponent(url)}`;

  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.min(el.clientWidth - 24, 900)));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  useEffect(() => { try { const s = localStorage.getItem("pdfhub:music"); if (s) { setMIn(s); } const v = localStorage.getItem("pdfhub:vol"); if (v) setVol(Math.min(100, Math.max(0, +v || 0))); } catch {} }, []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      if (e.key === "ArrowRight") setPage((p) => Math.min(pages, p + 1));
      if (e.key === "ArrowLeft") setPage((p) => Math.max(1, p - 1));
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  }, [pages]);

  function play() {
    const m = toMedia(mIn);
    if (!m) return setMErr("Usa un enlace de YouTube, Spotify, SoundCloud o un audio .mp3");
    setMErr(""); setMedia(m);
    try { localStorage.setItem("pdfhub:music", mIn.trim()); } catch {}
  }
  
  function applyVol(v: number) {
    if (!media) return;
    if (media.p === "audio" && aud.current) aud.current.volume = v / 100;
    const w = ifr.current?.contentWindow;
    if (!w) return;
    if (media.p === "yt") w.postMessage(JSON.stringify({ event: "command", func: "setVolume", args: [v] }), "*");
    if (media.p === "sc") w.postMessage(JSON.stringify({ method: "setVolume", value: v }), "*");
  }
  const ytCmd = (func: string) => ifr.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*");
  function onVol(v: number) { setVol(v); applyVol(v); try { localStorage.setItem("pdfhub:vol", String(v)); } catch {} }
  function onFrameLoad() {
    ifr.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: 1 }), "*");
    [400, 1200, 2500].forEach((t) => setTimeout(() => applyVol(vol), t));
  }
  const fullscreen = () => (document.fullscreenElement ? document.exitFullscreen() : box.current?.requestFullscreen());
  const b = "rounded-lg px-3 py-1.5 text-sm transition hover:bg-teal/20 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal";

  return (
    <div ref={box} className="relative flex h-screen flex-col">
      <motion.div initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-wrap items-center justify-between gap-2 border-b border-mist/10 bg-panel px-3 py-2">
        <div className="flex min-w-0 items-center gap-2"><Link href="/dashboard" className={b}>←</Link><h1 className="grad-text truncate font-bold">{title}</h1></div>
        <div className="flex flex-wrap items-center gap-1">
          <button className={b} disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Página anterior">‹</button>
          <span className="text-sm tabular-nums">{page} / {pages || "–"}</span>
          <button className={b} disabled={page >= pages} onClick={() => setPage(page + 1)} aria-label="Página siguiente">›</button>
          <button className={b} onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} aria-label="Alejar">−</button>
          <span className="w-12 text-center text-sm">{Math.round(zoom * 100)}%</span>
          <button className={b} onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} aria-label="Acercar">+</button>
          <ThemeToggle />
          <button className={b} onClick={fullscreen}>Pantalla completa</button>
        </div>
      </motion.div>
      <div className="flex-1 overflow-auto p-3">
        {err ? <p role="alert" className="mt-10 text-center">{err}</p> : (
          <Document file={pdfSourceUrl} onLoadSuccess={(d) => { setPages(d.numPages); setPage(1); }} onLoadError={(e) => { console.error(e); setErr(`No se pudo abrir este PDF (${e.message}). Verifica que el enlace sea correcto y tenga permisos públicos o de acceso.`); }}
            loading={<div className="mt-24 flex flex-col items-center gap-3"><motion.div className="h-12 w-12 rounded-full border-4 border-teal border-t-transparent" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }} /><p className="text-sm opacity-70">Cargando documento…</p></div>}>
            <AnimatePresence mode="wait">
              <motion.div key={page} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }} className="mx-auto w-fit overflow-hidden rounded-lg shadow-2xl ring-1 ring-teal/30">
                <Page pageNumber={page} width={w * zoom} renderTextLayer={false} renderAnnotationLayer={false} />
              </motion.div>
            </AnimatePresence>
          </Document>
        )}
      </div>

      <div className="absolute bottom-4 right-4 z-30 flex w-[min(22rem,calc(100vw-2rem))] flex-col items-end gap-2">
        <div className={`${dock ? "block" : "hidden"} w-full space-y-2 rounded-2xl bg-panel p-3 shadow-2xl ring-1 ring-mist/15`}>
          <div className="flex gap-2">
            <input className="input" placeholder="Enlace de YouTube, Spotify o SoundCloud" value={mIn} onChange={(e) => setMIn(e.target.value)} onKeyDown={(e) => e.key === "Enter" && play()} aria-label="Enlace de música" />
            <button className="btn" onClick={play}>Play</button>
          </div>
          {mErr && <p role="alert" className="text-xs text-red-400">{mErr}</p>}
          {media?.kind === "iframe" && <iframe ref={ifr} onLoad={onFrameLoad} key={media.src} src={media.src} height={media.h} className="w-full rounded-lg border-0" allow="autoplay; encrypted-media" title="Reproductor de música" />}
          {media?.kind === "audio" && <audio ref={aud} onLoadedMetadata={() => applyVol(vol)} key={media.src} src={media.src} controls autoPlay loop className="w-full" />}
          {media && (
            <div className="flex items-center gap-2">
              <span aria-hidden>{vol === 0 ? "🔇" : vol < 50 ? "🔉" : "🔊"}</span>
              <input type="range" min={0} max={100} value={vol} onChange={(e) => onVol(+e.target.value)} disabled={media.p === "sp"} className="w-full accent-teal disabled:opacity-40" aria-label="Volumen de la música" />
              <span className="w-8 text-right text-xs tabular-nums">{vol}</span>
            </div>
          )}
          {media?.p === "yt" && (
            <div className="flex justify-center gap-2">
              <button className="btn-ghost" onClick={() => ytCmd("previousVideo")} aria-label="Anterior">⏮</button>
              <button className="btn-ghost" onClick={() => ytCmd("playVideo")} aria-label="Reproducir">▶</button>
              <button className="btn-ghost" onClick={() => ytCmd("pauseVideo")} aria-label="Pausar">⏸</button>
              <button className="btn-ghost" onClick={() => ytCmd("nextVideo")} aria-label="Siguiente">⏭</button>
            </div>
          )}
          {media?.p === "sp" && <p className="text-xs opacity-70">Spotify no permite ajustar el volumen desde aquí; usa el control del reproductor o el volumen de tu dispositivo.</p>}
          {media && <button className="btn-ghost w-full" onClick={() => setMedia(null)}>Detener música</button>}
        </div>
        <button className="btn rounded-full" onClick={() => setDock(!dock)} aria-expanded={dock}>🎵 Música{media ? " ·  sonando" : ""}</button>
      </div>
    </div>
  );
}