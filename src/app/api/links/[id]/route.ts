import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { PdfLink } from "@/lib/models";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const u = await getUser(); if (!u || !isValidObjectId(params.id)) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  await dbConnect();
  const r = await PdfLink.findOneAndDelete({ _id: params.id, userId: u.id });
  return r ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "No encontrado" }, { status: 404 });
}
