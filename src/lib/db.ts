import mongoose from "mongoose";
const uri = process.env.MONGODB_URI as string;
const g = globalThis as unknown as { _m?: { c: typeof mongoose | null; p: Promise<typeof mongoose> | null } };
const cache = (g._m ??= { c: null, p: null });
export async function dbConnect() {
  if (!uri) throw new Error("Falta MONGODB_URI");
  if (cache.c) return cache.c;
  cache.p ??= mongoose.connect(uri, { bufferCommands: false });
  cache.c = await cache.p;
  return cache.c;
}
