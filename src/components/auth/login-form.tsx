"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, ArrowRight, Loader2, UtensilsCrossed } from "lucide-react";

import { createClient } from "@/lib/supabase";
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// ─── Mapeo de errores de Supabase Auth ───────────────────────────────────────
function getAuthErrorMessage(message: string): { title: string; description: string } {
  if (message.toLowerCase().includes("invalid login credentials")) {
    return {
      title: "Credenciales incorrectas",
      description: "El correo o la contraseña no son correctos. Inténtalo de nuevo.",
    };
  }
  if (message.toLowerCase().includes("email not confirmed")) {
    return {
      title: "Email no verificado",
      description: "Revisa tu bandeja de entrada y confirma tu dirección de correo antes de acceder.",
    };
  }
  if (message.toLowerCase().includes("too many requests")) {
    return {
      title: "Demasiados intentos",
      description: "Por seguridad, espera unos minutos antes de volver a intentarlo.",
    };
  }
  return {
    title: "Error al iniciar sesión",
    description: message,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────
export function LoginForm() {
  const router  = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = (values: LoginFormValues) => {
    startTransition(async () => {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email:    values.email,
        password: values.password,
      });

      if (error) {
        const { title, description } = getAuthErrorMessage(error.message);
        toast({ variant: "destructive", title, description });
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed overflow-hidden">

      {/* ── Blobs decorativos de fondo ─────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none fixed top-[-10%] left-[-5%] w-[40%] h-[60%] bg-surface-container-low rounded-full blur-[120px] opacity-50"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-[-10%] right-[-5%] w-[30%] h-[50%] bg-surface-container-high rounded-full blur-[100px] opacity-40"
      />

      {/* ── Contenido central ─────────────────────────────────────────── */}
      <main className="flex-grow flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[480px]">

          {/* Branding */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-6 shadow-primary-glow">
              <UtensilsCrossed className="text-on-primary w-8 h-8" strokeWidth={1.5} />
            </div>
            <h1 className="font-headline font-extrabold text-3xl tracking-tighter text-on-surface">
              La CartAI
            </h1>
            <p className="font-body text-on-surface-variant mt-2 text-sm text-center">
              Bienvenido a la nueva era de tu gestión digital.
            </p>
          </div>

          {/* ── Card con glassmorphism ───────────────────────────────────── */}
          <div
            className={cn(
              // Glassmorphism según design system
              "bg-white/70 backdrop-blur-glass",
              // No-Line rule: solo borde outline-variant al 15%
              "border border-outline-variant/15",
              "rounded-2xl p-10 shadow-float"
            )}
          >
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block font-label text-sm font-semibold text-on-surface-variant ml-1"
                >
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="text-on-surface-variant w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="curator@miegocio.com"
                    className="pl-12"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-error text-xs ml-1 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label
                    htmlFor="password"
                    className="font-label text-sm font-semibold text-on-surface-variant"
                  >
                    Contraseña
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-primary font-label text-sm font-medium hover:underline transition-all"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="text-on-surface-variant w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pl-12 pr-12"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                  {/* Toggle mostrar contraseña */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant/60 hover:text-on-surface-variant transition-colors"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    <span className="text-xs font-medium select-none">
                      {showPassword ? "Ocultar" : "Ver"}
                    </span>
                  </button>
                </div>
                {errors.password && (
                  <p className="text-error text-xs ml-1 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Recordarme */}
              <div className="flex items-center space-x-3 ml-1">
                <input
                  id="rememberMe"
                  type="checkbox"
                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary transition-all cursor-pointer accent-primary"
                  {...register("rememberMe")}
                />
                <label
                  htmlFor="rememberMe"
                  className="font-label text-sm text-on-surface-variant cursor-pointer select-none"
                >
                  Recordarme por 30 días
                </label>
              </div>

              {/* CTA principal */}
              <button
                type="submit"
                disabled={isPending}
                className={cn(
                  "w-full flex items-center justify-center space-x-2",
                  "bg-gradient-to-b from-primary to-primary-container",
                  "text-on-primary font-headline font-bold py-4 rounded-xl",
                  "shadow-primary-glow hover:shadow-primary-glow-lg",
                  "active:scale-[0.98] transition-all duration-200",
                  "disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                )}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Iniciando sesión…</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Sesión</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Separador y registro */}
            <div className="mt-8 pt-8 border-t border-outline-variant/15">
              <p className="text-center font-label text-sm text-on-surface-variant">
                ¿No tienes una cuenta?{" "}
                <Link
                  href="/register"
                  className="text-primary font-bold hover:underline transition-all"
                >
                  Solicitar Acceso
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="relative z-10 flex flex-col md:flex-row justify-between items-center w-full px-12 py-8 border-t border-outline-variant/15 bg-surface">
        <p className="font-body text-sm text-outline mb-4 md:mb-0">
          © 2025 La CartAI. Todos los derechos reservados.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <Link href="/privacidad" className="font-body text-sm text-outline hover:text-on-surface transition-colors">
            Política de Privacidad
          </Link>
          <Link href="/terminos" className="font-body text-sm text-outline hover:text-on-surface transition-colors">
            Términos de Servicio
          </Link>
          <Link href="/soporte" className="font-body text-sm text-outline hover:text-on-surface transition-colors">
            Soporte
          </Link>
        </div>
      </footer>

    </div>
  );
}
