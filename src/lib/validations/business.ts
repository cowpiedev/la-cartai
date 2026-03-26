import { z } from "zod";

export const businessConfigSchema = z.object({
  name:    z.string().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
  address: z.string().min(1, "La dirección es obligatoria").max(255, "Máximo 255 caracteres"),
  phone:   z.string().min(1, "El teléfono es obligatorio").max(20, "Máximo 20 caracteres"),
  logoUrl: z.string().optional(),
});

export type BusinessConfigValues = z.infer<typeof businessConfigSchema>;
