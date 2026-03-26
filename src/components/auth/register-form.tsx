"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  QrCode,
  Sparkles,
} from "lucide-react";

import { createClient } from "@/lib/supabase";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { createBusinessAndUser } from "@/actions/register";
import { cn } from "@/lib/utils";

// ─── Mapeo de errores de Supabase Auth ───────────────────────────────────────
function getRegisterErrorMessage(message: string): { title: string; description: string } {
  const lower = message.toLowerCase();
  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return {
      title: "Email ya registrado",
      description: "Ya existe una cuenta con este correo. Inicia sesión o usa otro email.",
    };
  }
  if (lower.includes("password should be")) {
    return {
      title: "Contraseña insegura",
      description: "La contraseña no cumple los requisitos mínimos de seguridad.",
    };
  }
  if (lower.includes("too many requests")) {
    return {
      title: "Demasiados intentos",
      description: "Por seguridad, espera unos minutos antes de volver a intentarlo.",
    };
  }
  return {
    title: "Error al registrarse",
    description: message,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────
export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      businessName: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    startTransition(async () => {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) {
        const { title, description } = getRegisterErrorMessage(error.message);
        toast({ variant: "destructive", title, description });
        return;
      }

      if (!data.user) {
        toast({
          variant: "destructive",
          title: "Error al registrarse",
          description: "No se pudo crear la cuenta. Inténtalo de nuevo.",
        });
        return;
      }

      // Crear negocio y usuario en BD
      const result = await createBusinessAndUser({
        userId: data.user.id,
        email: values.email,
        name: values.name,
        businessName: values.businessName,
      });

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Error al configurar tu negocio",
          description: result.error,
        });
        return;
      }

      // Si hay sesión activa (email confirm desactivado) → dashboard
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        // Email confirm activado → informar al usuario
        toast({
          variant: "default",
          title: "¡Casi listo!",
          description: "Revisa tu bandeja de entrada y confirma tu dirección de correo para acceder.",
        });
      }
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
      <main className="flex-grow flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ── Columna izquierda: Brand Context ──────────────────────── */}
          <div className="hidden lg:block space-y-8 pr-12">
            <div className="space-y-3">
              <span className="text-primary font-headline font-bold tracking-widest text-xs uppercase">
                Hostelería Establecida
              </span>
              <h1 className="text-6xl font-headline font-extrabold text-on-surface leading-[1.1] tracking-tighter">
                La CartAI{" "}
                <span className="text-primary-container">Digital</span>{" "}
                para Tu Visión.
              </h1>
            </div>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
              Únete a una red de líderes de la hostelería. Proporcionamos la infraestructura
              invisible que hace que tu servicio sea inolvidable.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="bg-surface-container-low p-6 rounded-xl space-y-3">
                <QrCode className="text-primary w-6 h-6" strokeWidth={1.5} />
                <h3 className="font-headline font-bold text-on-surface">Carta Digital QR</h3>
                <p className="text-sm text-on-surface-variant">
                  Carta siempre actualizada accesible desde cualquier dispositivo.
                </p>
              </div>
              <div className="bg-surface-container-low p-6 rounded-xl space-y-3">
                <Sparkles className="text-primary w-6 h-6" strokeWidth={1.5} />
                <h3 className="font-headline font-bold text-on-surface">IA de Precios</h3>
                <p className="text-sm text-on-surface-variant">
                  Analiza el mercado y optimiza tus precios con inteligencia artificial.
                </p>
              </div>
            </div>
          </div>

          {/* ── Columna derecha: Formulario ────────────────────────────── */}
          <div className="w-full flex justify-center lg:justify-end">
            <div
              className={cn(
                "bg-white/70 backdrop-blur-glass",
                "border border-outline-variant/15",
                "rounded-2xl p-8 md:p-10 shadow-float",
                "w-full max-w-md"
              )}
            >
              {/* Branding mobile */}
              <div className="mb-8 lg:hidden text-center">
                <h2 className="text-3xl font-headline font-extrabold text-on-surface tracking-tighter">
                  La CartAI
                </h2>
              </div>

              <div className="space-y-1 mb-8">
                <h2 className="text-2xl font-headline font-bold text-on-surface">
                  Registra Tu Negocio
                </h2>
                <p className="text-on-surface-variant text-sm">
                  Comienza tu viaje hacia experiencias de cliente fluidas.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

                {/* Nombre del negocio */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="businessName"
                    className="block text-xs font-semibold text-on-surface-variant tracking-wider uppercase ml-1"
                  >
                    Nombre del Negocio
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building2 className="text-on-surface-variant w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <Input
                      id="businessName"
                      type="text"
                      autoComplete="organization"
                      placeholder="ej. El Rincón de Paco"
                      className="pl-12"
                      aria-invalid={!!errors.businessName}
                      {...register("businessName")}
                    />
                  </div>
                  {errors.businessName && (
                    <p className="text-error text-xs ml-1 mt-1">{errors.businessName.message}</p>
                  )}
                </div>

                {/* Nombre del responsable */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="name"
                    className="block text-xs font-semibold text-on-surface-variant tracking-wider uppercase ml-1"
                  >
                    Nombre del Responsable
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="text-on-surface-variant w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <Input
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Nombre Completo"
                      className="pl-12"
                      aria-invalid={!!errors.name}
                      {...register("name")}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-error text-xs ml-1 mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Correo corporativo */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-on-surface-variant tracking-wider uppercase ml-1"
                  >
                    Correo Corporativo
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="text-on-surface-variant w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="nombre@negocio.com"
                      className="pl-12"
                      aria-invalid={!!errors.email}
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-error text-xs ml-1 mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Contraseñas — side by side en desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Contraseña */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="password"
                      className="block text-xs font-semibold text-on-surface-variant tracking-wider uppercase ml-1"
                    >
                      Contraseña
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
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant/60 hover:text-on-surface-variant transition-colors"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        <span className="text-[10px] font-medium select-none">
                          {showPassword ? "Ocultar" : "Ver"}
                        </span>
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-error text-xs ml-1 mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  {/* Confirmar contraseña */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-semibold text-on-surface-variant tracking-wider uppercase ml-1"
                    >
                      Confirmar
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
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant/60 hover:text-on-surface-variant transition-colors"
                        aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        <span className="text-[10px] font-medium select-none">
                          {showConfirm ? "Ocultar" : "Ver"}
                        </span>
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-error text-xs ml-1 mt-1">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </div>

                {/* CTA principal */}
                <div className="pt-2">
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
                        <span>Creando tu negocio…</span>
                      </>
                    ) : (
                      <>
                        <span>Registrarse</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>

                {/* Link a login */}
                <div className="pt-2 text-center">
                  <p className="text-sm text-on-surface-variant">
                    ¿Ya tienes una cuenta?{" "}
                    <Link
                      href="/login"
                      className="text-primary font-bold hover:underline transition-all"
                    >
                      Iniciar sesión
                    </Link>
                  </p>
                </div>
              </form>

              {/* Legal */}
              <div className="mt-8 pt-6 border-t border-outline-variant/15 text-center">
                <p className="text-[10px] text-on-surface-variant/60 leading-relaxed uppercase tracking-widest">
                  Al unirte, aceptas nuestros{" "}
                  <Link href="/terminos" className="hover:text-on-surface-variant transition-colors">
                    Términos de Servicio
                  </Link>{" "}
                  y{" "}
                  <Link href="/privacidad" className="hover:text-on-surface-variant transition-colors">
                    Política de Privacidad
                  </Link>
                  .
                </p>
              </div>
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
