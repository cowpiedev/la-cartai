import { z } from "zod";

export const dishSchema = z
  .object({
    name: z
      .string()
      .min(1, "El nombre del plato es obligatorio")
      .max(120, "El nombre no puede superar los 120 caracteres"),

    description: z
      .string()
      .min(1, "La descripción o receta es obligatoria"),

    photoUrl: z
      .string()
      .min(1, "La fotografía del plato es obligatoria"),

    categoryId: z.string().optional(),

    price: z
      .number({ invalid_type_error: "Introduce un precio válido" })
      .positive("El precio debe ser mayor que 0"),

    allergenIds: z.array(z.string()).default([]),

    isActive: z.boolean().default(true),

    isDailySpecial: z.boolean().default(false),

    specialDate: z.date().optional(),
  })
  .refine((data) => !data.isDailySpecial || data.specialDate !== undefined, {
    message: "Indica la fecha de vigencia del plato del día",
    path: ["specialDate"],
  });

export type DishSchemaValues = z.infer<typeof dishSchema>;
