import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Nueva Contraseña — La CartAI",
  description: "Restablece tu contraseña para acceder a tu negocio.",
};

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { code?: string };
}) {
  return <ResetPasswordForm code={searchParams.code ?? null} />;
}
