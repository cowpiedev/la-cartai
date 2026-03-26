"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Lock,
  ArrowRight,
  Loader2,
  UtensilsCrossed,
  AlertTriangle,
} from "lucide-react";

import { createClient } from "@/lib/supabase";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// ─── Mapeo de errores de updateUser ──────────────────────────────────────────
function getUpdateErrorMessage(message: string): { title: string; description: string } {
  if (message.toLowerCase().includes("same password")) {
    return {
      title: "Contraseña sin cambios",
      description: "La nueva contraseña no puede ser igual a la anterior.",
    };
  }
  return {
    title: "Error al actualizar",
    description: "No pudimos actualizar la contraseña. Inténtalo de nuevo.",
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────
interface ResetPasswordFormProps {
  code: string | null;
}

export function ResetPasswordForm({ code }: ResetPasswordFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [ready, setReady] = useState(false);
  const [codeError, setCodeError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  // Intercambiar code por sesión al montar
  useEffect(() => {
    if (!code) {
      setCodeError(true);
      return;
    }

    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setCodeError(true);
      }
      setReady(true);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (values: ResetPasswordFormValues) => {
    startTransition(async () => {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        const { title, description } = getUpdateErrorMessage(error.message);
        toast({ variant: "destructive", title, description });
        return;
      }

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña se ha restablecido correctamente.",
      });
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
              Restablece el acceso a tu negocio.
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
            {/* Estado: enlace inválido */}
            {codeError && (
              <div className="text-center py-4">
                <AlertTriangle
                  className="w-14 h-14 text-error mx-auto mb-6"
                  strokeWidth={1.5}
                />
                <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight mb-3">
                  Enlace inválido o caducado
                </h2>
                <p className="font-body text-on-surface-variant leading-relaxed text-sm mb-8">
                  El enlace de recuperación no es válido o ha expirado. Solicita
                  uno nuevo para restablecer tu contraseña.
                </p>
                <Link
                  href="/forgot-password"
                  className={cn(
                    "inline-flex items-center justify-center gap-2",
                    "bg-gradient-to-b from-primary to-primary-container",
                    "text-on-primary font-headline font-bold py-3 px-6 rounded-xl",
                    "shadow-primary-glow active:scale-[0.98] transition-all duration-200"
                  )}
                >
                  Solicitar nuevo enlace
                </Link>
              </div>
            )}

            {/* Estado: cargando (intercambiando código) */}
            {!codeError && !ready && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" strokeWidth={1.5} />
                <p className="font-body text-sm text-on-surface-variant">
                  Verificando enlace…
                </p>
              </div>
            )}

            {/* Estado: formulario listo */}
            {!codeError && ready && (
              <>
                <div className="mb-8">
                  <h2 className="font-headline font-bold text-2xl text-on-surface tracking-tight mb-3">
                    Nueva Contraseña
                  </h2>
                  <p className="font-body text-on-surface-variant leading-relaxed text-sm">
                    Elige una contraseña segura de al menos 8 caracteres.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

                  {/* Nueva contraseña */}
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block font-label text-sm font-semibold text-on-surface-variant ml-1"
                    >
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="text-on-surface-variant w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="pl-12 pr-12"
                        aria-invalid={!!errors.password}
                        {...register("password")}
                      />
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

                  {/* Confirmar contraseña */}
                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="block font-label text-sm font-semibold text-on-surface-variant ml-1"
                    >
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="text-on-surface-variant w-5 h-5" strokeWidth={1.5} />
                      </div>
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="pl-12 pr-12"
                        aria-invalid={!!errors.confirmPassword}
                        {...register("confirmPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant/60 hover:text-on-surface-variant transition-colors"
                        aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        <span className="text-xs font-medium select-none">
                          {showConfirm ? "Ocultar" : "Ver"}
                        </span>
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-error text-xs ml-1 mt-1">{errors.confirmPassword.message}</p>
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
                        <span>Guardando…</span>
                      </>
                    ) : (
                      <>
                        <span>Guardar nueva contraseña</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </>
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
