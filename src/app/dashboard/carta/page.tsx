import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { CartaClient } from "./_components/carta-client";
import type { DishForClient, CategoryForClient } from "./_components/carta-client";

export default async function CartaPage() {
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

  const [dishes, categories] = await Promise.all([
    prisma.dish.findMany({
      where: { businessId: dbUser.businessId },
      include: {
        category: { select: { id: true, name: true } },
      },
      orderBy: [{ isDailySpecial: "desc" }, { isActive: "desc" }, { name: "asc" }],
    }),
    prisma.category.findMany({
      where: { businessId: dbUser.businessId },
      orderBy: { position: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  // Serialize Decimal → number for the client boundary
  const dishesForClient: DishForClient[] = dishes.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    photoUrl: d.photoUrl,
    price: Number(d.price),
    isActive: d.isActive,
    isDailySpecial: d.isDailySpecial,
    specialDate: d.specialDate ? d.specialDate.toISOString() : null,
    category: d.category,
  }));

  const categoriesForClient: CategoryForClient[] = categories;

  return <CartaClient dishes={dishesForClient} categories={categoriesForClient} />;
}
