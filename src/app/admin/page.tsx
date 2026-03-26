import { Bell, Building2, UtensilsCrossed, Wifi, Crown } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { MetricCard } from "./_components/metric-card";
import { BusinessesTable } from "./_components/businesses-table";

export default async function AdminPage() {
  const [totalBusinesses, totalDishes, premiumCount, rawBusinesses] =
    await Promise.all([
      prisma.business.count(),
      prisma.dish.count(),
      prisma.business.count({ where: { plan: "premium" } }),
      prisma.business.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          plan: true,
          status: true,
          createdAt: true,
          owner: { select: { email: true, name: true } },
          _count: { select: { dishes: true } },
        },
      }),
    ]);

  // Serializar fechas antes de pasar al Client Component
  const businesses = rawBusinesses.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
  }));

  // TODO: analytics model (MenuView) — accesos a cartas públicas
  const totalAccesses: number = 0;

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-surface/80 backdrop-blur-md px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-extrabold text-on-surface">
            Panel de Administración
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Bienvenido al núcleo de gestión de La CartAI
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            title="Notificaciones"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant transition-colors relative"
          >
            <Bell className="w-5 h-5" strokeWidth={2} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="px-8 pb-8 space-y-8 max-w-7xl w-full">
        {/* Bento metrics grid */}
        <section className="grid grid-cols-4 gap-6">
          <MetricCard
            title="Total de negocios"
            value={totalBusinesses.toLocaleString("es-ES")}
            icon={<Building2 className="w-6 h-6" strokeWidth={2} />}
            iconBg="bg-primary/10 text-primary"
          />
          <MetricCard
            title="Platos creados"
            value={totalDishes.toLocaleString("es-ES")}
            icon={<UtensilsCrossed className="w-6 h-6" strokeWidth={2} />}
            iconBg="bg-tertiary/10 text-tertiary"
          />
          <MetricCard
            title="Accesos a cartas (30d)"
            value={totalAccesses === 0 ? "—" : totalAccesses.toLocaleString("es-ES")}
            icon={<Wifi className="w-6 h-6" strokeWidth={2} />}
            iconBg="bg-surface-container text-on-surface-variant"
            badge="Próximamente"
            badgeVariant="neutral"
          />
          <MetricCard
            title="Suscripciones activas"
            value={premiumCount.toLocaleString("es-ES")}
            icon={<Crown className="w-6 h-6" strokeWidth={2} />}
            iconBg="bg-tertiary/10 text-tertiary"
            badge="Premium"
            badgeVariant="premium"
          />
        </section>

        {/* Businesses table */}
        <section>
          <BusinessesTable businesses={businesses} />
        </section>
      </div>
    </>
  );
}
