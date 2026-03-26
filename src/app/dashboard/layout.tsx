import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ImpersonationBanner } from "./_components/impersonation-banner";
import { cn } from "@/lib/utils";

export default async function DashboardLayout({
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
    select: {
      name: true,
      role: true,
      business: {
        select: { slug: true, plan: true, name: true, id: true },
      },
    },
  });

  if (!dbUser) redirect("/login");

  // ── Impersonación (solo superadmin) ──────────────────────────────────────
  let effectiveBusiness = dbUser.business;
  let isImpersonating = false;

  if (dbUser.role === "superadmin") {
    const impersonatedId = cookies().get("admin_impersonate_business_id")?.value;
    if (impersonatedId) {
      const target = await prisma.business.findUnique({
        where: { id: impersonatedId },
        select: { slug: true, plan: true, name: true, id: true },
      });
      if (target) {
        effectiveBusiness = target;
        isImpersonating = true;
      }
    }
  }

  if (!effectiveBusiness) {
    // Superadmin sin impersonación no tiene negocio propio → volver al panel
    if (dbUser.role === "superadmin") redirect("/admin");
    redirect("/login");
  }
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-surface min-h-screen font-body text-on-surface">
      {isImpersonating && (
        <ImpersonationBanner businessName={effectiveBusiness.name} />
      )}
      <Sidebar
        businessSlug={effectiveBusiness.slug}
        businessPlan={effectiveBusiness.plan}
        businessName={effectiveBusiness.name}
        userName={dbUser.name}
      />
      {/* Offset sidebar escritorio + clearance bottom nav móvil + espacio banner si aplica */}
      <div
        className={cn(
          "md:ml-64 min-h-screen pb-28 md:pb-0",
          isImpersonating && "mt-12"
        )}
      >
        {children}
      </div>
    </div>
  );
}
