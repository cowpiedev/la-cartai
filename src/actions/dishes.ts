"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";
import type { DishSchemaValues } from "@/lib/validations/dish";

async function getAuthenticatedBusinessId(): Promise<string> {
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
  return dbUser.businessId;
}

export async function toggleDishActive(dishId: string): Promise<ActionResult> {
  const businessId = await getAuthenticatedBusinessId();

  const dish = await prisma.dish.findFirst({
    where: { id: dishId, businessId },
    select: { isActive: true },
  });
  if (!dish) return { success: false, error: "Plato no encontrado" };

  await prisma.dish.update({
    where: { id: dishId },
    data: { isActive: !dish.isActive },
  });

  revalidatePath("/dashboard/carta");
  return { success: true, data: undefined };
}

export async function deleteDish(dishId: string): Promise<ActionResult> {
  const businessId = await getAuthenticatedBusinessId();

  const dish = await prisma.dish.findFirst({
    where: { id: dishId, businessId },
    select: { id: true },
  });
  if (!dish) return { success: false, error: "Plato no encontrado" };

  await prisma.dish.delete({ where: { id: dishId } });

  revalidatePath("/dashboard/carta");
  return { success: true, data: undefined };
}

export async function createDish(
  data: DishSchemaValues
): Promise<ActionResult<{ id: string }>> {
  const businessId = await getAuthenticatedBusinessId();

  const { allergenIds, specialDate, categoryId, ...rest } = data;

  const dish = await prisma.dish.create({
    data: {
      ...rest,
      businessId,
      categoryId: categoryId ?? null,
      specialDate: specialDate ?? null,
      allergens: {
        create: allergenIds.map((allergenId) => ({ allergenId })),
      },
    },
    select: { id: true },
  });

  revalidatePath("/dashboard/carta");
  return { success: true, data: { id: dish.id } };
}

export async function updateDishPrice(
  dishId: string,
  price: number
): Promise<ActionResult> {
  const businessId = await getAuthenticatedBusinessId();

  const dish = await prisma.dish.findFirst({
    where: { id: dishId, businessId },
    select: { id: true },
  });
  if (!dish) return { success: false, error: "Plato no encontrado" };

  await prisma.dish.update({
    where: { id: dishId },
    data: { price },
  });

  revalidatePath("/dashboard/carta");
  revalidatePath("/dashboard/ia-precios");
  return { success: true, data: undefined };
}

export async function updateDish(
  dishId: string,
  data: DishSchemaValues
): Promise<ActionResult<{ id: string }>> {
  const businessId = await getAuthenticatedBusinessId();

  const existing = await prisma.dish.findFirst({
    where: { id: dishId, businessId },
    select: { id: true },
  });
  if (!existing) return { success: false, error: "Plato no encontrado" };

  const { allergenIds, specialDate, categoryId, ...rest } = data;

  await prisma.$transaction([
    prisma.dishAllergen.deleteMany({ where: { dishId } }),
    prisma.dish.update({
      where: { id: dishId },
      data: {
        ...rest,
        categoryId: categoryId ?? null,
        specialDate: specialDate ?? null,
      },
    }),
    prisma.dishAllergen.createMany({
      data: allergenIds.map((allergenId) => ({ dishId, allergenId })),
    }),
  ]);

  revalidatePath("/dashboard/carta");
  revalidatePath(`/dashboard/carta/${dishId}/editar`);
  return { success: true, data: { id: dishId } };
}
