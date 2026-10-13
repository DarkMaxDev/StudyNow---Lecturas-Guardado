import Nav from "@/components/Nav";
import Collections from "@/components/Collections";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function Dashboard() {
  const u = await getUser(); if (!u) redirect("/login");
  return <><Nav admin={u.role === "admin"} /><Collections /></>;
}
