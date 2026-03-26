import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { DishForm } from "@/components/dashboard/dish-form";

export default async function NuevoPlatoPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
    select: { businessId: true },
  });
  if (!dbUser?.businessId) redirect("/login");

  const businessId = dbUser.businessId;

  const [categories, allergens, business] = await Promise.all([
    prisma.category.findMany({
      where: { businessId },
      orderBy: { position: "asc" },
      select: { id: true, name: true },
    }),
    prisma.allergen.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, iconUrl: true },
    }),
    prisma.business.findUnique({
      where: { id: businessId },
      select: { plan: true },
    }),
  ]);

  return (
    <DishForm
      mode="create"
      categories={categories}
      allergens={allergens}
      isPremium={business?.plan === "premium"}
      businessId={businessId}
    />
  );
}
