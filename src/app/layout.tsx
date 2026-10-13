import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import Background from "@/components/Background";
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
export const metadata: Metadata = { title: "PDF Hub", description: "Lee y organiza tus PDFs en colecciones" };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}` }} /></head>
    <body className={`${manrope.variable} font-sans min-h-screen`}><Background />{children}</body>
  </html>;
}
