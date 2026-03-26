"use server";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "@/types";

interface CreateBusinessAndUserInput {
  userId: string;
  email: string;
  name: string;
  businessName: string;
}

export async function createBusinessAndUser(
  input: CreateBusinessAndUserInput
): Promise<ActionResult<void>> {
  const { userId, email, name, businessName } = input;

  try {
    // Generar slug único
    const baseSlug = slugify(businessName);
    let slug = baseSlug;
    let attempt = 1;

    while (attempt <= 10) {
      const existing = await prisma.business.findUnique({ where: { slug } });
      if (!existing) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
    }

    // Crear negocio
    const business = await prisma.business.create({
      data: {
        slug,
        name: businessName,
        ownerId: userId,
      },
    });

    // Crear usuario
    await prisma.user.create({
      data: {
        authId: userId,
        email,
        name,
        role: "owner",
        businessId: business.id,
      },
    });

    return { success: true, data: undefined };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return { success: false, error: message };
  }
}
