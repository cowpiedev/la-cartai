import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "./_components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
    select: { role: true, name: true },
  });

  // Redirigir silenciosamente si no es superadmin (no revelar la existencia del panel)
  if (dbUser?.role !== "superadmin") redirect("/dashboard");

  return (
    <div className="bg-surface min-h-screen font-body text-on-surface flex">
      <AdminSidebar userName={dbUser.name} />
      <div className="ml-64 flex-1 min-h-screen flex flex-col">{children}</div>
    </div>
  );
}
