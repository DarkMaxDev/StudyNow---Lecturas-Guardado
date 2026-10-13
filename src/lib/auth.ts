import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { dbConnect } from "./db";
import { User } from "./models";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/login" },
  providers: [Credentials({
    credentials: { email: {}, password: {} },
    async authorize(c) {
      if (!c?.email || !c?.password) return null;
      await dbConnect();
      const u = await User.findOne({ email: c.email.toLowerCase() });
      if (!u || !(await bcrypt.compare(c.password, u.password))) return null;
      return { id: String(u._id), name: u.nombre, email: u.email, role: u.role } as any;
    },
  })],
  callbacks: {
    jwt({ token, user }) { if (user) { token.id = user.id; token.role = (user as any).role; } return token; },
    session({ session, token }) { (session.user as any).id = token.id; (session.user as any).role = token.role; return session; },
  },
};

export type SessionUser = { id: string; role: "user" | "admin"; name?: string; email?: string };
export async function getUser(): Promise<SessionUser | null> {
  const s = await getServerSession(authOptions);
  return (s?.user as SessionUser) ?? null;
}
