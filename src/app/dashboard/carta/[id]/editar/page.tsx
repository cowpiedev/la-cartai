import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { DishForm } from "@/components/dashboard/dish-form";

interface EditarPlatoPageProps {
  params: { id: string };
}

export default async function EditarPlatoPage({ params }: EditarPlatoPageProps) {
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

  const [dish, categories, allergens, business] = await Promise.all([
    prisma.dish.findFirst({
      where: { id: params.id, businessId },
      include: {
        allergens: { select: { allergenId: true } },
      },
    }),
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

  if (!dish) notFound();

  // Serialize for client boundary: Decimal → number, Date → ISO string
  const initialValues = {
    name: dish.name,
    description: dish.description ?? "",
    photoUrl: dish.photoUrl ?? "",
    categoryId: dish.categoryId ?? undefined,
    price: Number(dish.price),
    isActive: dish.isActive,
    isDailySpecial: dish.isDailySpecial,
    specialDate: dish.specialDate?.toISOString(),
    allergenIds: dish.allergens.map((a) => a.allergenId),
  };

  return (
    <DishForm
      mode="edit"
      dishId={dish.id}
      initialValues={initialValues}
      categories={categories}
      allergens={allergens}
      isPremium={business?.plan === "premium"}
      businessId={businessId}
    />
  );
}
