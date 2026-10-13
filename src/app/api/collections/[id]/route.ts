import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { Collection, PdfLink } from "@/lib/models";

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const u = await getUser(); if (!u || !isValidObjectId(params.id)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const p = z.object({ title: z.string().min(1).max(80) }).safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Título inválido" }, { status: 400 });
  await dbConnect();
  const c = await Collection.findOneAndUpdate({ _id: params.id, userId: u.id }, { title: p.data.title }, { new: true });
  return c ? NextResponse.json(c) : NextResponse.json({ error: "No encontrada" }, { status: 404 });
}

export async function DELETE(_: Request, { params }: Ctx) {
  const u = await getUser(); if (!u || !isValidObjectId(params.id)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  await dbConnect();
  const c = await Collection.findOneAndDelete({ _id: params.id, userId: u.id });
  if (!c) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  await PdfLink.deleteMany({ collectionId: params.id, userId: u.id });
  return NextResponse.json({ ok: true });
}
