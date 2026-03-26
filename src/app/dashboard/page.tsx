import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Utensils,
  Send,
  LayoutGrid,
  TrendingUp,
  PlusCircle,
  Eye,
  QrCode,
  Sparkles,
  Bell,
  BarChart2,
} from "lucide-react";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

// ─── Saludo según hora del servidor ──────────────────────────────────────────
function getGreeting(firstName: string) {
  const h = new Date().getHours();
  if (h < 12) return `Buenos días, ${firstName}`;
  if (h < 20) return `Buenas tardes, ${firstName}`;
  return `Buenas noches, ${firstName}`;
}

// ─── Página del Dashboard ─────────────────────────────────────────────────────
export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
    select: {
      name: true,
      businessId: true,
      business: {
        select: { id: true, slug: true, plan: true, name: true },
      },
    },
  });

  if (!dbUser?.businessId || !dbUser.business) redirect("/login");

  const { businessId, business, name: userName } = dbUser;

  // Inicio del día actual (hora local del servidor)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [activeDishes, todayDishes, categoriesCount] = await Promise.all([
    prisma.dish.count({ where: { businessId, isActive: true } }),
    prisma.dish.count({ where: { businessId, createdAt: { gte: startOfToday } } }),
    prisma.category.count({ where: { businessId } }),
  ]);

  const isPremium = business.plan === "premium";
  const firstName = userName.split(" ")[0];
  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <>
      {/* ── Sticky Header ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-glass px-6 py-6 flex items-center justify-between">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface leading-none">
            {getGreeting(firstName)}
          </h2>
          <p className="text-on-surface-variant mt-1 text-sm font-medium">
            Resumen de hoy en{" "}
            <span className="text-primary font-bold">La CartAI</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5" strokeWidth={1.5} />
          </button>
          {/* Avatar móvil (la sidebar no está en mobile) */}
          <div className="md:hidden w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold select-none">
            {initials}
          </div>
        </div>
      </header>

      {/* ── Content Canvas ────────────────────────────────────────────── */}
      <div className="px-6 pb-8 space-y-8 max-w-7xl mx-auto">

        {/* ── Métricas Bento ─────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card: Platos activos */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between group shadow-float">
            <div
              aria-hidden
              className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"
            />
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Utensils className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold">
                <TrendingUp className="w-3 h-3" strokeWidth={2} />
                Activos
              </span>
            </div>
            <div className="mt-6">
              <p className="text-on-surface-variant font-medium text-sm">
                Platos activos
              </p>
              <h3 className="font-headline text-4xl font-extrabold text-on-surface mt-1">
                {activeDishes}
              </h3>
            </div>
          </div>

          {/* Card: Platos publicados hoy */}
          <div className="bg-surface-container-lowest p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between group shadow-float">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                <Send className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold">
                <TrendingUp className="w-3 h-3" strokeWidth={2} />
                Hoy
              </span>
            </div>
            <div className="mt-6">
              <p className="text-on-surface-variant font-medium text-sm">
                Platos publicados hoy
              </p>
              <h3 className="font-headline text-4xl font-extrabold text-on-surface mt-1">
                {todayDishes}
              </h3>
            </div>
          </div>

          {/* Card: Categorías */}
          <div className="bg-surface-container-low p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between group shadow-float">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-on-surface-variant/10 flex items-center justify-center text-on-surface-variant">
                <LayoutGrid className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <span className="bg-white/60 text-on-surface-variant px-2.5 py-1 rounded-full text-xs font-bold">
                Estable
              </span>
            </div>
            <div className="mt-6">
              <p className="text-on-surface-variant font-medium text-sm">
                Categorías creadas
              </p>
              <h3 className="font-headline text-4xl font-extrabold text-on-surface mt-1">
                {categoriesCount}
              </h3>
            </div>
          </div>
        </section>

        {/* ── Acciones rápidas ───────────────────────────────────────── */}
        <section className="space-y-4">
          <h4 className="font-headline text-xl font-bold text-on-surface">
            Acciones rápidas
          </h4>
          <div className="flex flex-wrap gap-4">

            {/* Añadir nuevo plato */}
            <Link
              href="/dashboard/carta/nuevo"
              className={cn(
                "flex-1 min-w-[200px] flex items-center justify-center gap-3",
                "bg-gradient-to-b from-primary to-primary-container text-on-primary",
                "py-4 px-6 rounded-xl font-headline font-bold",
                "shadow-primary-glow hover:shadow-primary-glow-lg",
                "active:scale-[0.98] transition-all duration-200"
              )}
            >
              <PlusCircle className="w-5 h-5 shrink-0" strokeWidth={2} />
              <span>Añadir nuevo plato</span>
            </Link>

            {/* Ver mi carta */}
            <Link
              href={`/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex-1 min-w-[200px] flex items-center justify-center gap-3",
                "bg-surface-container-lowest border border-outline-variant/20 text-on-surface",
                "py-4 px-6 rounded-xl font-headline font-bold",
                "hover:bg-white transition-colors active:scale-[0.98]"
              )}
            >
              <Eye className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              <span>Ver mi carta pública</span>
            </Link>

            {/* Gestionar QR */}
            <Link
              href="/dashboard/configuracion"
              className={cn(
                "flex-1 min-w-[200px] flex items-center justify-center gap-3",
                "bg-surface-container-lowest border border-outline-variant/20 text-on-surface",
                "py-4 px-6 rounded-xl font-headline font-bold",
                "hover:bg-white transition-colors active:scale-[0.98]"
              )}
            >
              <QrCode className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              <span>Gestionar QR</span>
            </Link>
          </div>
        </section>

        {/* ── Sección principal: IA + Vista pública ──────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Panel de IA de Precios */}
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-float">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary">
                <Sparkles className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  Inteligencia de Precios
                </h3>
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">
                  Optimización con IA
                </p>
              </div>
            </div>

            {isPremium ? (
              <div className="space-y-6">
                <div className="p-4 bg-tertiary/5 rounded-2xl border-l-4 border-tertiary">
                  <p className="text-sm text-on-surface leading-relaxed">
                    <span className="font-bold text-tertiary">Sugerencia:</span>{" "}
                    Analiza los precios de tus platos respecto al mercado local
                    para maximizar el margen sin perder competitividad.
                  </p>
                </div>
                <div className="space-y-4">
                  <Link
                    href="/dashboard/ia-precios"
                    className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-on-surface-variant" strokeWidth={1.5} />
                      <span className="text-sm font-semibold text-on-surface">
                        Análisis de precios
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary">Abrir</span>
                  </Link>
                  <Link
                    href="/dashboard/ia-precios"
                    className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <BarChart2 className="w-5 h-5 text-on-surface-variant" strokeWidth={1.5} />
                      <span className="text-sm font-semibold text-on-surface">
                        Competencia local
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary">Detalles</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Teaser para plan free */
              <div className="space-y-4">
                <div className="p-4 bg-primary-fixed/30 rounded-2xl border-l-4 border-primary">
                  <p className="text-sm text-on-surface leading-relaxed">
                    <span className="font-bold text-primary">Plan Premium:</span>{" "}
                    Obtén sugerencias de precios basadas en IA y análisis de
                    competidores cercanos.
                  </p>
                </div>
                <Link
                  href="/dashboard/configuracion"
                  className={cn(
                    "flex items-center justify-center gap-2 w-full",
                    "bg-gradient-to-b from-primary to-primary-container text-on-primary",
                    "py-3 px-6 rounded-xl font-headline font-bold text-sm",
                    "shadow-primary-glow active:scale-[0.98] transition-all"
                  )}
                >
                  <Sparkles className="w-4 h-4" strokeWidth={2} />
                  Actualizar a Premium
                </Link>
              </div>
            )}
          </div>

          {/* Tarjeta Vista Pública */}
          <div
            className={cn(
              "relative overflow-hidden rounded-3xl flex flex-col justify-end p-8",
              "min-h-[380px]",
              "bg-gradient-to-br from-on-surface via-inverse-surface to-primary"
            )}
          >
            {/* Blob decorativo */}
            <div
              aria-hidden
              className="absolute top-0 right-0 w-64 h-64 bg-primary-container/30 rounded-full -mr-32 -mt-32 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute bottom-0 left-0 w-48 h-48 bg-tertiary-container/20 rounded-full -ml-24 -mb-24 blur-2xl"
            />

            {/* Contenido */}
            <div className="relative z-10 text-white">
              <span className="inline-block px-3 py-1 bg-primary text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                Vista Previa de Carta
              </span>
              <h3 className="font-headline text-3xl font-extrabold mb-2 leading-tight">
                {business.name}
              </h3>
              <p className="text-white/70 text-sm mb-6 max-w-sm">
                Tu carta digital está disponible para tus clientes en{" "}
                <span className="text-white font-medium">
                  lacartai.com/{business.slug}
                </span>
              </p>
              <Link
                href={`/${business.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-2",
                  "bg-white/10 backdrop-blur-glass border border-white/20 text-white",
                  "px-6 py-3 rounded-full font-headline font-bold text-sm",
                  "hover:bg-white/20 transition-all active:scale-[0.98]"
                )}
              >
                <Eye className="w-4 h-4" strokeWidth={1.5} />
                <span>Acceso Público</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
