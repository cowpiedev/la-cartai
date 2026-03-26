"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";
import type { BusinessConfigValues } from "@/lib/validations/business";

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function getAuthenticatedBusinessId(): Promise<string> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
    select: { businessId: true, role: true },
  });
  if (!dbUser) redirect("/login");

  // Superadmin: puede actuar como cualquier negocio via cookie de impersonación
  if (dbUser.role === "superadmin") {
    const impersonatedId = cookies().get("admin_impersonate_business_id")?.value;
    if (impersonatedId) return impersonatedId;
    redirect("/admin");
  }

  if (!dbUser.businessId) redirect("/login");
  return dbUser.businessId;
}

// ─── Business config ──────────────────────────────────────────────────────────

export async function getBusinessConfig() {
  const businessId = await getAuthenticatedBusinessId();

  const [business, categories] = await Promise.all([
    prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        slug: true,
        name: true,
        address: true,
        phone: true,
        logoUrl: true,
      },
    }),
    prisma.category.findMany({
      where: { businessId },
      orderBy: { position: "asc" },
      select: { id: true, name: true, position: true },
    }),
  ]);

  if (!business) redirect("/login");
  return { business, categories };
}

export async function updateBusinessConfig(
  data: BusinessConfigValues
): Promise<ActionResult<void>> {
  try {
    const businessId = await getAuthenticatedBusinessId();
    const { logoUrl, ...rest } = data;

    await prisma.business.update({
      where: { id: businessId },
      data: {
        ...rest,
        ...(logoUrl !== undefined ? { logoUrl } : {}),
      },
    });

    revalidatePath("/dashboard/configuracion");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al guardar la configuración" };
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function createCategory(
  name: string
): Promise<ActionResult<{ id: string; name: string; position: number }>> {
  try {
    const businessId = await getAuthenticatedBusinessId();

    const last = await prisma.category.findFirst({
      where: { businessId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        position: (last?.position ?? 0) + 1,
        businessId,
      },
      select: { id: true, name: true, position: true },
    });

    revalidatePath("/dashboard/configuracion");
    revalidatePath("/dashboard/carta");
    return { success: true, data: category };
  } catch {
    return { success: false, error: "Error al crear la categoría" };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult<void>> {
  try {
    const businessId = await getAuthenticatedBusinessId();

    const cat = await prisma.category.findFirst({
      where: { id, businessId },
      select: { id: true },
    });
    if (!cat) return { success: false, error: "Categoría no encontrada" };

    await prisma.category.delete({ where: { id } });

    revalidatePath("/dashboard/configuracion");
    revalidatePath("/dashboard/carta");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al eliminar la categoría" };
  }
}

export async function reorderCategories(
  orderedIds: string[]
): Promise<ActionResult<void>> {
  try {
    const businessId = await getAuthenticatedBusinessId();

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.category.updateMany({
          where: { id, businessId },
          data: { position: index + 1 },
        })
      )
    );

    revalidatePath("/dashboard/configuracion");
    revalidatePath("/dashboard/carta");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al reordenar las categorías" };
  }
}
