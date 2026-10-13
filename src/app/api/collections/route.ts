import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { Collection, PdfLink, User } from "@/lib/models";

export async function GET() {
  const u = await getUser(); if (!u) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  await dbConnect();
  const [collections, links, me] = await Promise.all([
    Collection.find({ userId: u.id }).sort({ createdAt: -1 }).lean(),
    PdfLink.find({ userId: u.id }).sort({ createdAt: -1 }).lean(),
    User.findById(u.id).select("pdfLimit").lean<{ pdfLimit: number }>(),
  ]);
  return NextResponse.json({ collections, links, limit: me?.pdfLimit ?? 0 });
}

export async function POST(req: Request) {
  const u = await getUser(); if (!u) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const p = z.object({ title: z.string().min(1).max(80) }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Título inválido" }, { status: 400 });
  await dbConnect();
  return NextResponse.json(await Collection.create({ title: p.data.title, userId: u.id }), { status: 201 });
}
