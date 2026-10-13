"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
const PdfViewer = dynamic(() => import("@/components/PdfViewer"), { ssr: false });

function Inner() {
  const p = useSearchParams();
  const url = p.get("url");
  if (!url) return <p className="p-8">Falta el enlace del PDF.</p>;
  return <PdfViewer url={url} title={p.get("title") ?? "Documento"} />;
}
export default function ViewerPage() { return <Suspense><Inner /></Suspense>; }
