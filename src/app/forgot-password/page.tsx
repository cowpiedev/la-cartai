import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Recuperar Contraseña — La CartAI",
  description: "Introduce tu email para recibir un enlace de recuperación.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
