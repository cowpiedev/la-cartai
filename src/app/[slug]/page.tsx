import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { DishCard } from "./_components/dish-card";
import { CategoryNav } from "./_components/category-nav";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const business = await prisma.business.findUnique({
    where: { slug: params.slug },
    select: { name: true, logoUrl: true },
  });
  if (!business) return { title: "Carta no encontrada" };
  return {
    title: business.name,
    description: `Carta digital de ${business.name}`,
    openGraph: {
      title: business.name,
      description: `Descubre la carta de ${business.name}`,
      images: business.logoUrl ? [{ url: business.logoUrl }] : [],
      type: "website",
    },
  };
}

export default async function PublicMenuPage({ params }: Props) {
  const { slug } = params;

  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      categories: {
        include: {
          dishes: {
            where: { isActive: true },
            include: {
              category: true,
              allergens: { include: { allergen: true } },
            },
            orderBy: { name: "asc" },
          },
        },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!business) notFound();

  // Daily specials: platos con isDailySpecial=true y specialDate=hoy (o null)
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const dailySpecials = await prisma.dish.findMany({
    where: {
      businessId: business.id,
      isActive: true,
      isDailySpecial: true,
      OR: [
        { specialDate: null },
        { specialDate: { gte: todayStart, lt: todayEnd } },
      ],
    },
    include: {
      category: true,
      allergens: { include: { allergen: true } },
    },
  });

  // Solo categorías con platos activos
  const categories = business.categories.filter((c) => c.dishes.length > 0);

  return (
    <>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <header className="bg-white/80 backdrop-blur-glass sticky top-0 z-40 shadow-[0_1px_0_rgba(18,28,40,0.06)]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {business.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.logoUrl}
                alt=""
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            )}
            <span className="font-headline font-extrabold tracking-tight text-xl text-primary truncate">
              {business.name}
            </span>
          </div>

          {/* Desktop: links de categoría */}
          <nav className="hidden lg:flex items-center gap-6">
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#cat-${cat.id}`}
                className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors"
              >
                {cat.name}
              </a>
            ))}
          </nav>

          <a
            href="/"
            className="hidden lg:block shrink-0 text-xs text-on-surface-variant hover:text-primary transition-colors"
          >
            Powered by{" "}
            <span className="font-headline font-bold text-primary">La Carta IA</span>
          </a>
        </div>
      </header>

      {/* ─── Mobile layout ───────────────────────────────────────────────── */}
      <div className="lg:hidden">
        <div className="px-4 pt-6 space-y-6">
          {/* Platos del Día — carousel */}
          {dailySpecials.length > 0 && (
            <section>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="font-headline text-2xl font-extrabold text-on-surface">
                  Platos del Día
                </h2>
                <span className="text-primary text-xs font-bold uppercase tracking-widest">
                  Hoy
                </span>
              </div>
              <div className="hide-scrollbar flex overflow-x-auto gap-4 -mx-4 px-4 snap-x snap-mandatory pb-2">
                {dailySpecials.map((dish) => (
                  <DishCard key={dish.id} dish={dish} variant="featured" />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sticky category pills */}
        {categories.length > 1 && (
          <div className="sticky top-[65px] z-30 -mx-0 px-4 py-2 bg-background/95 backdrop-blur-md">
            <CategoryNav categories={categories} variant="pills" />
          </div>
        )}

        {/* Category sections */}
        <div className="px-4 mt-4 space-y-10 pb-10">
          {categories.map((cat) => (
            <section key={cat.id} id={`cat-${cat.id}`}>
              <h3 className="font-headline text-lg font-bold text-primary mb-4 flex items-center gap-2">
                {cat.name}
              </h3>
              <div className="space-y-3">
                {cat.dishes.map((dish) => (
                  <DishCard key={dish.id} dish={dish} variant="list" />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Allergen info card */}
        <div className="mx-4 mb-8 bg-surface-container rounded-3xl p-6 text-center">
          <h5 className="font-headline font-bold text-on-surface mb-2">
            ¿Tienes alguna alergia?
          </h5>
          <p className="text-sm text-on-surface-variant">
            Pulsa en el icono ⓘ de cada plato para ver los alérgenos.
          </p>
        </div>
      </div>

      {/* ─── Desktop layout ──────────────────────────────────────────────── */}
      <div className="hidden lg:flex max-w-7xl mx-auto px-8 gap-12 mt-10">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 sticky top-28 h-fit space-y-6">
          <CategoryNav categories={categories} variant="sidebar" />
          <div className="bg-surface-container p-5 rounded-3xl space-y-2">
            <p className="font-semibold text-sm text-on-surface">
              Información alérgenos
            </p>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Consulte a nuestro personal sobre cualquier intolerancia o
              restricción alimentaria.
            </p>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-16 pb-20">
          {/* Platos del Día */}
          {dailySpecials.length > 0 && (
            <section>
              <div className="mb-8">
                <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
                  Platos del Día
                </h2>
                <p className="text-on-surface-variant mt-1">
                  Selección diaria de temporada
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dailySpecials.map((dish) => (
                  <DishCard key={dish.id} dish={dish} variant="grid" />
                ))}
              </div>
            </section>
          )}

          {/* Category sections */}
          {categories.map((cat) => (
            <section key={cat.id} id={`cat-${cat.id}`}>
              <h2 className="font-headline text-2xl font-extrabold tracking-tight mb-8">
                {cat.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cat.dishes.map((dish) => (
                  <DishCard key={dish.id} dish={dish} variant="grid" />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-surface-container-low mt-8 py-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center space-y-1">
          <p className="font-headline font-bold text-lg text-primary">
            {business.name}
          </p>
          {business.address && (
            <p className="text-sm text-on-surface-variant">{business.address}</p>
          )}
          {business.phone && (
            <p className="text-sm text-on-surface-variant">{business.phone}</p>
          )}
          <p className="text-xs text-on-surface-variant pt-3">
            Carta digital creada con{" "}
            <a href="/" className="text-primary font-semibold hover:underline">
              La Carta IA
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
