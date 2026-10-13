"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const schema = z.object({ nombre: z.string().min(2, "Mínimo 2 caracteres").optional().or(z.literal("")), email: z.string().email("Correo inválido"), password: z.string().min(8, "Mínimo 8 caracteres") });
type F = z.infer<typeof schema>;

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const reg = mode === "register";
  const router = useRouter();
  const [err, setErr] = useState("");
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) });

  async function onSubmit(d: F) {
    setErr("");
    if (reg) {
      if (!d.nombre) return setError("nombre", { message: "Escribe tu nombre" });
      const r = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
      if (!r.ok) return setErr((await r.json()).error ?? "No se pudo crear la cuenta");
    }
    const s = await signIn("credentials", { email: d.email, password: d.password, redirect: false });
    if (s?.error) return setErr("Correo o contraseña incorrectos");
    router.push("/dashboard"); router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <motion.form onSubmit={handleSubmit(onSubmit)} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-4 rounded-2xl bg-panel p-6 shadow-2xl">
        <h1 className="text-2xl font-bold">{reg ? "Crea tu cuenta" : "Inicia sesión"}</h1>
        {reg && <div><input className="input" placeholder="Nombre" {...register("nombre")} />{errors.nombre && <p className="mt-1 text-xs text-red-300">{errors.nombre.message}</p>}</div>}
        <div><input className="input" type="email" placeholder="Correo" autoComplete="email" {...register("email")} />{errors.email && <p className="mt-1 text-xs text-red-300">{errors.email.message}</p>}</div>
        <div><input className="input" type="password" placeholder="Contraseña" autoComplete={reg ? "new-password" : "current-password"} {...register("password")} />{errors.password && <p className="mt-1 text-xs text-red-300">{errors.password.message}</p>}</div>
        {err && <p role="alert" className="text-sm text-red-300">{err}</p>}
        <button className="btn w-full" disabled={isSubmitting}>{isSubmitting ? "Procesando…" : reg ? "Crear cuenta" : "Entrar"}</button>
        <p className="text-center text-sm text-mist/70">{reg ? "¿Ya tienes cuenta? " : "¿Aún no tienes cuenta? "}<Link className="text-teal underline" href={reg ? "/login" : "/register"}>{reg ? "Inicia sesión" : "Regístrate"}</Link></p>
      </motion.form>
    </main>
  );
}
