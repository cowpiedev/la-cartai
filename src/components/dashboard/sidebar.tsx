"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  BookOpen,
  CalendarDays,
  LayoutGrid,
  TrendingUp,
  Settings,
  UtensilsCrossed,
  HelpCircle,
  LogOut,
  Plus,
  Home,
} from "lucide-react";

import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface SidebarProps {
  businessSlug: string;
  businessPlan: string; // "free" | "premium"
  businessName: string;
  userName: string;
}

export function Sidebar({
  businessPlan,
  businessName,
  userName,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isPremium = businessPlan === "premium";

  const handleLogout = () => {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    });
  };

  // Primeras letras del nombre para el avatar
  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const isCartaActive =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/carta");
  const isConfigActive = pathname.startsWith("/dashboard/configuracion");
  const isIAActive = pathname.startsWith("/dashboard/ia-precios");

  return (
    <>
      {/* ───────────────────────────────── Desktop Sidebar */}
      <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-low py-6 font-body antialiased z-30">

        {/* Logo + nombre negocio */}
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-primary-glow shrink-0">
            <UtensilsCrossed className="text-on-primary w-5 h-5" strokeWidth={1.5} />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-headline font-bold text-xl tracking-tight text-primary leading-none">
              La CartAI
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold truncate mt-0.5">
              {businessName}
            </p>
          </div>
        </div>

        {/* Navegación principal */}
        <nav className="flex-1 space-y-1 px-3">
          {/* Carta (activo también en /dashboard) */}
          <Link
            href="/dashboard/carta"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 active:scale-95",
              isCartaActive
                ? "bg-primary/10 text-primary font-semibold"
                : "text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            <BookOpen className="w-5 h-5 shrink-0" strokeWidth={1.5} />
            <span>Carta</span>
          </Link>

          {/* Platos del día */}
          <Link
            href="/dashboard/carta"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 active:scale-95",
              "text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            <CalendarDays className="w-5 h-5 shrink-0" strokeWidth={1.5} />
            <span>Platos del día</span>
          </Link>

          {/* Categorías */}
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 active:scale-95",
              "text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            <LayoutGrid className="w-5 h-5 shrink-0" strokeWidth={1.5} />
            <span>Categorías</span>
          </Link>

          {/* IA de Precios — solo plan premium */}
          {isPremium && (
            <Link
              href="/dashboard/ia-precios"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 active:scale-95",
                isIAActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              <TrendingUp className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              <span>IA de Precios</span>
            </Link>
          )}

          {/* Configuración */}
          <Link
            href="/dashboard/configuracion"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 active:scale-95",
              isConfigActive
                ? "bg-primary/10 text-primary font-semibold"
                : "text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            <Settings className="w-5 h-5 shrink-0" strokeWidth={1.5} />
            <span>Configuración</span>
          </Link>
        </nav>

        {/* Sección inferior */}
        <div className="px-3 mt-auto space-y-2">
          <Link
            href="/soporte"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <HelpCircle className="w-5 h-5 shrink-0" strokeWidth={1.5} />
            <span>Ayuda</span>
          </Link>

          {/* Tarjeta de usuario */}
          <div className="bg-surface-container-high rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold shrink-0 select-none">
              {initials}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-on-surface truncate">{userName}</p>
              <p className="text-xs text-on-surface-variant">
                {isPremium ? "Premium" : "Plan gratuito"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="text-on-surface-variant hover:text-error transition-colors disabled:opacity-40"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>

      {/* ───────────────────────────── Mobile Bottom Navigation */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 w-full z-50 md:hidden",
          "flex justify-around items-center px-4 pb-6 pt-3",
          "bg-white/80 backdrop-blur-glass",
          "shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)] rounded-t-3xl"
        )}
      >
        {/* Carta */}
        <Link
          href="/dashboard/carta"
          className={cn(
            "flex flex-col items-center justify-center px-3 py-1 transition-all duration-150 active:scale-95",
            pathname.startsWith("/dashboard/carta") && pathname !== "/dashboard"
              ? "text-primary"
              : "text-on-surface-variant"
          )}
        >
          <BookOpen
            className="w-6 h-6 mb-1"
            strokeWidth={pathname.startsWith("/dashboard/carta") && pathname !== "/dashboard" ? 2 : 1.5}
          />
          <span className="text-[10px] font-medium">Carta</span>
        </Link>

        {/* Platos */}
        <Link
          href="/dashboard/carta"
          className="flex flex-col items-center justify-center px-3 py-1 text-on-surface-variant transition-all duration-150 active:scale-95"
        >
          <CalendarDays className="w-6 h-6 mb-1" strokeWidth={1.5} />
          <span className="text-[10px] font-medium">Platos</span>
        </Link>

        {/* Inicio — botón central elevado */}
        <Link
          href="/dashboard"
          className={cn(
            "flex flex-col items-center justify-center px-4 py-2 rounded-2xl -mt-8 shadow-lg transition-all duration-150 active:scale-95",
            pathname === "/dashboard"
              ? "bg-primary text-on-primary shadow-primary-glow"
              : "bg-surface-container text-on-surface-variant shadow-float"
          )}
        >
          <Home
            className="w-6 h-6 mb-0.5"
            strokeWidth={pathname === "/dashboard" ? 2 : 1.5}
          />
          <span className="text-[10px] font-bold">Inicio</span>
        </Link>

        {/* IA de Precios */}
        {isPremium ? (
          <Link
            href="/dashboard/ia-precios"
            className={cn(
              "flex flex-col items-center justify-center px-3 py-1 transition-all duration-150 active:scale-95",
              isIAActive ? "text-primary" : "text-on-surface-variant"
            )}
          >
            <TrendingUp className="w-6 h-6 mb-1" strokeWidth={isIAActive ? 2 : 1.5} />
            <span className="text-[10px] font-medium">Precios</span>
          </Link>
        ) : (
          <span className="flex flex-col items-center justify-center px-3 py-1 text-on-surface-variant/40 cursor-not-allowed select-none">
            <TrendingUp className="w-6 h-6 mb-1" strokeWidth={1.5} />
            <span className="text-[10px] font-medium">Precios</span>
          </span>
        )}

        {/* Configuración */}
        <Link
          href="/dashboard/configuracion"
          className={cn(
            "flex flex-col items-center justify-center px-3 py-1 transition-all duration-150 active:scale-95",
            isConfigActive ? "text-primary" : "text-on-surface-variant"
          )}
        >
          <Settings className="w-6 h-6 mb-1" strokeWidth={isConfigActive ? 2 : 1.5} />
          <span className="text-[10px] font-medium">Config</span>
        </Link>
      </nav>

      {/* ────────────────────────────── Mobile FAB */}
      <Link
        href="/dashboard/carta/nuevo"
        className={cn(
          "fixed bottom-24 right-6 w-14 h-14 z-40 md:hidden",
          "bg-primary rounded-2xl text-on-primary",
          "shadow-2xl shadow-primary/40",
          "flex items-center justify-center",
          "active:scale-90 transition-transform"
        )}
        aria-label="Añadir nuevo plato"
      >
        <Plus className="w-7 h-7" strokeWidth={2} />
      </Link>
    </>
  );
}
