import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { PdfLink, User } from "@/lib/models";

async function admin() { const u = await getUser(); return u?.role === "admin" ? u : null; }

export async function GET() {
  if (!(await admin())) return NextResponse.json({ error: "Prohibido" }, { status: 403 });
  await dbConnect();
  const [users, counts] = await Promise.all([
    User.find().select("-password").sort({ createdAt: -1 }).lean<any[]>(),
    PdfLink.aggregate([{ $group: { _id: "$userId", n: { $sum: 1 } } }]),
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.n as number]));
  const rows = users.map((x) => ({ _id: String(x._id), nombre: x.nombre, email: x.email, role: x.role, pdfLimit: x.pdfLimit, count: map.get(String(x._id)) ?? 0 }));
  return NextResponse.json({ users: rows, totalUsers: rows.length, totalLinks: rows.reduce((a, r) => a + r.count, 0) });
}

export async function PATCH(req: Request) {
  if (!(await admin())) return NextResponse.json({ error: "Prohibido" }, { status: 403 });
  const p = z.object({ id: z.string().length(24), delta: z.number().int().min(-100).max(100) }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  await dbConnect();
  const u = await User.findById(p.data.id);
  if (!u) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  u.pdfLimit = Math.max(0, u.pdfLimit + p.data.delta);
  await u.save();
  return NextResponse.json({ pdfLimit: u.pdfLimit });
}
