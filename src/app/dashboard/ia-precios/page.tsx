import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { PriceAnalysisClient } from "./_components/price-analysis-client";

interface PageProps {
  searchParams: { dish?: string };
}

export default async function IaPreciosPage({ searchParams }: PageProps) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
    select: {
      businessId: true,
      business: {
        select: { plan: true, address: true },
      },
    },
  });

  if (!dbUser?.businessId || !dbUser.business) redirect("/login");
  if (dbUser.business.plan !== "premium") redirect("/dashboard");

  const dishId = searchParams.dish;
  if (!dishId) redirect("/dashboard/carta");

  const dish = await prisma.dish.findFirst({
    where: { id: dishId, businessId: dbUser.businessId },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
    },
  });

  if (!dish) redirect("/dashboard/carta");

  return (
    <PriceAnalysisClient
      dish={{
        id: dish.id,
        name: dish.name,
        description: dish.description ?? "",
        price: Number(dish.price),
      }}
      businessAddress={dbUser.business.address ?? ""}
    />
  );
}
