"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  UtensilsCrossed,
  CheckCircle2,
} from "lucide-react";

import { createClient } from "@/lib/supabase";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// ─── Mapeo de errores de Supabase Auth ───────────────────────────────────────
function getErrorMessage(message: string): { title: string; description: string } {
  if (message.toLowerCase().includes("too many requests")) {
    return {
      title: "Demasiados intentos",
      description: "Por seguridad, espera unos minutos antes de volver a intentarlo.",
    };
  }
  return {
    title: "Error al enviar el enlace",
    description: "No pudimos procesar tu solicitud. Inténtalo de nuevo.",
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────
export function ForgotPasswordForm() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (values: ForgotPasswordFormValues) => {
    startTransition(async () => {
      const supabase = createClient();

      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        // Solo mostrar error en casos de rate-limit u errores de red reales
        // No revelar si el email existe o no
        if (
          error.message.toLowerCase().includes("too many requests") ||
          error.status === 429
        ) {
          const { title, description } = getErrorMessage(error.message);
          toast({ variant: "destructive", title, description });
          return;
        }
      }

      // En todos los demás casos (éxito o email no encontrado) mostrar confirmación
      setSent(true);
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
              Recupera el acceso a tu negocio.
            </p>
          </div>

          {/* ── Card con glassmorphism ───────────────────────────────────── */}
          <div
            className={cn(
              "bg-white/70 backdrop-blur-glass",
              "border border-outline-variant/15",
              "rounded-2xl p-10 shadow-float"
            )}
          >
            {!sent ? (
              /* ── Formulario ── */
              <>
                <div className="mb-8">
                  <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight mb-3">
                    Recuperar Contraseña
                  </h2>
                  <p className="font-body text-on-surface-variant leading-relaxed text-sm">
                    Introduce tu correo electrónico y te enviaremos un enlace para
                    restablecer tu contraseña.
                  </p>
                </div>

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
                        placeholder="nombre@minegocio.com"
                        className="pl-12"
                        aria-invalid={!!errors.email}
                        {...register("email")}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-error text-xs ml-1 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  {/* CTA */}
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
                        <span>Enviando…</span>
                      </>
                    ) : (
                      <>
                        <span>Enviar enlace de recuperación</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Link volver */}
                <div className="mt-8 pt-8 border-t border-outline-variant/15 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 font-label text-sm font-semibold text-tertiary hover:text-tertiary-container transition-colors duration-200"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver a iniciar sesión</span>
                  </Link>
                </div>
              </>
            ) : (
              /* ── Confirmación ── */
              <div className="text-center py-4">
                <CheckCircle2
                  className="w-14 h-14 text-primary mx-auto mb-6"
                  strokeWidth={1.5}
                />
                <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight mb-3">
                  Enlace enviado
                </h2>
                <p className="font-body text-on-surface-variant leading-relaxed text-sm mb-8">
                  Si el correo está registrado, recibirás un enlace en breve.
                  Revisa también tu carpeta de spam.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 font-label text-sm font-semibold text-tertiary hover:text-tertiary-container transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver al inicio de sesión</span>
                </Link>
              </div>
            )}
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
