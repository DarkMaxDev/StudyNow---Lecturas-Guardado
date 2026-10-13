import Nav from "@/components/Nav";
import AdminPanel from "@/components/AdminPanel";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function Admin() {
  const u = await getUser();
  if (!u) redirect("/login");
  if (u.role !== "admin") redirect("/dashboard");
  return <><Nav admin /><AdminPanel /></>;
}
