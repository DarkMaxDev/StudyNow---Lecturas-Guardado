import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { User } from "@/lib/models";

export async function GET() {
  const u = await getUser(); if (!u) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  await dbConnect();
  const me = await User.findById(u.id).select("bgUrl").lean<{ bgUrl?: string }>();
  return NextResponse.json({ bgUrl: me?.bgUrl ?? "" });
}

const schema = z.object({ bgUrl: z.union([z.literal(""), z.string().max(500).regex(/^https?:\/\/[^\s"'()<>\\]+$/)]) });

export async function PATCH(req: Request) {
  const u = await getUser(); if (!u) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const p = schema.safeParse(await req.json().catch(() => null));
  if (!p.success) return NextResponse.json({ error: "Enlace de imagen inválido (http/https, sin espacios ni paréntesis)" }, { status: 400 });
  await dbConnect();
  await User.findByIdAndUpdate(u.id, { bgUrl: p.data.bgUrl });
  return NextResponse.json({ bgUrl: p.data.bgUrl });
}
