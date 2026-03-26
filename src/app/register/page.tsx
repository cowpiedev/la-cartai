import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Registra Tu Negocio — La CartAI",
  description: "Crea tu cuenta y gestiona tu carta digital con inteligencia artificial.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
