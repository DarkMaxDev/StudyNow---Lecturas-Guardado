"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Background() {
  const [url, setUrl] = useState("");
  const path = usePathname();
  useEffect(() => {
    fetch("/api/me").then((r) => (r.ok ? r.json() : null)).then((d) => setUrl(d?.bgUrl ?? "")).catch(() => {});
    const h = (e: Event) => setUrl((e as CustomEvent<string>).detail);
    window.addEventListener("pdfhub:bg", h);
    return () => window.removeEventListener("pdfhub:bg", h);
  }, [path]);
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-sky-300 via-fuchsia-200 to-amber-200 dark:from-black dark:via-neutral-900 dark:to-neutral-800">
      {url ? (
        <>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${url}")` }} />
          <div className="absolute inset-0 bg-white/30 dark:bg-black/60" />
        </>
      ) : (
        <>
          <motion.div className="absolute -left-24 top-10 h-96 w-96 rounded-full bg-fuchsia-400/50 blur-3xl dark:bg-white/10" animate={{ x: [0, 90, 0], y: [0, 60, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-cyan-300/50 blur-3xl dark:bg-neutral-400/10" animate={{ x: [0, -80, 0], y: [0, -70, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} />
        </>
      )}
    </div>
  );
}