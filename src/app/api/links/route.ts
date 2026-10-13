import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { Collection, PdfLink, User } from "@/lib/models";

const schema = z.object({ url: z.string().url().refine((v) => /^https?:\/\//i.test(v)), title: z.string().min(1).max(120), collectionId: z.string().length(24) });

export async function POST(req: Request) {
  const u = await getUser(); if (!u) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Enlace o título inválido (usa http/https)" }, { status: 400 });
  await dbConnect();
  if (!(await Collection.exists({ _id: p.data.collectionId, userId: u.id }))) return NextResponse.json({ error: "Colección no encontrada" }, { status: 404 });
  const [me, count] = await Promise.all([User.findById(u.id).select("pdfLimit").lean<{ pdfLimit: number }>(), PdfLink.countDocuments({ userId: u.id })]);
  const limit = me?.pdfLimit ?? 0;
  if (count >= limit) return NextResponse.json({ error: `Alcanzaste tu límite de ${limit} PDFs. Pide a un administrador ampliarlo.` }, { status: 403 });
  return NextResponse.json(await PdfLink.create({ ...p.data, userId: u.id }), { status: 201 });
}
