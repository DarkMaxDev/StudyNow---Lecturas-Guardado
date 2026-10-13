import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { User } from "@/lib/models";

const schema = z.object({ nombre: z.string().min(2).max(60), email: z.string().email(), password: z.string().min(8).max(100) });

export async function POST(req: Request) {
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  await dbConnect();
  const email = p.data.email.toLowerCase();
  if (await User.exists({ email })) return NextResponse.json({ error: "Ese correo ya está registrado" }, { status: 409 });
  const isAdmin = !!process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase();
  await User.create({ nombre: p.data.nombre, email, password: await bcrypt.hash(p.data.password, 12), role: isAdmin ? "admin" : "user" });
  return NextResponse.json({ ok: true }, { status: 201 });
}
