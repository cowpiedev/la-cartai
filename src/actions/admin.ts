"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import type { ActionResult } from "@/types";
import type { BusinessPlan, BusinessStatus } from "@prisma/client";

const IMPERSONATE_COOKIE = "admin_impersonate_business_id";

// ─── Auth guard ───────────────────────────────────────────────────────────────

async function assertSuperadmin(): Promise<void> {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
    select: { role: true },
  });
  if (dbUser?.role !== "superadmin") redirect("/dashboard");
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function changePlan(
  businessId: string,
  newPlan: BusinessPlan
): Promise<ActionResult<void>> {
  await assertSuperadmin();
  try {
    await prisma.business.update({
      where: { id: businessId },
      data: { plan: newPlan },
    });
    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al cambiar el plan" };
  }
}

export async function toggleStatus(
  businessId: string,
  newStatus: BusinessStatus
): Promise<ActionResult<void>> {
  await assertSuperadmin();
  if (!["active", "suspended", "trial"].includes(newStatus)) {
    return { success: false, error: "Estado no válido" };
  }
  try {
    await prisma.business.update({
      where: { id: businessId },
      data: { status: newStatus },
    });
    revalidatePath("/admin");
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al cambiar el estado" };
  }
}

export async function impersonateBusiness(
  businessId: string
): Promise<ActionResult<void>> {
  await assertSuperadmin();

  const business = await prisma.business.findUnique({
    where: { id: businessId },
    select: { id: true },
  });
  if (!business) return { success: false, error: "Negocio no encontrado" };

  cookies().set(IMPERSONATE_COOKIE, businessId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60, // 1 hora
  });

  return { success: true, data: undefined };
}

export async function stopImpersonation(): Promise<ActionResult<void>> {
  await assertSuperadmin();
  cookies().delete(IMPERSONATE_COOKIE);
  return { success: true, data: undefined };
}
