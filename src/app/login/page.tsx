import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Accede al panel de gestión de tu carta digital.",
};

export default function LoginPage() {
  return <LoginForm />;
}
