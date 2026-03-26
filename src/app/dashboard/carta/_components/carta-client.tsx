"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Pencil,
  EyeOff,
  Eye,
  Trash2,
  X,
  Star,
  Clock,
  UtensilsCrossed,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleDishActive, deleteDish } from "@/actions/dishes";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DishForClient {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  price: number;
  isActive: boolean;
  isDailySpecial: boolean;
  specialDate: string | null; // ISO string (serialized from Date)
  category: { id: string; name: string } | null;
}

export interface CategoryForClient {
  id: string;
  name: string;
}

type StatusFilter = "todos" | "activo" | "inactivo" | "plato-del-dia" | "fuera-de-carta";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type DishStatus = "activo" | "inactivo" | "plato-del-dia" | "fuera-de-carta";

function getDishStatus(dish: DishForClient): DishStatus {
  if (dish.isDailySpecial) return "plato-del-dia";
  if (!dish.isActive && dish.specialDate) return "fuera-de-carta";
  if (dish.isActive) return "activo";
  return "inactivo";
}

const STATUS_LABELS: Record<DishStatus, string> = {
  activo: "Activo",
  inactivo: "Inactivo",
  "plato-del-dia": "Plato del día",
  "fuera-de-carta": "Fuera de carta",
};

const STATUS_PILL: Record<DishStatus, string> = {
  activo: "bg-emerald-100 text-emerald-700",
  inactivo: "bg-surface-container-high text-on-surface-variant",
  "plato-del-dia": "bg-amber-100 text-amber-700",
  "fuera-de-carta": "bg-primary/10 text-primary",
};

// ─── Delete Modal ──────────────────────────────────────────────────────────────

function DeleteModal({
  dish,
  onCancel,
  onConfirm,
  isPending,
}: {
  dish: DishForClient;
  onCancel: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(18,28,40,0.25)", backdropFilter: "blur(12px)" }}
    >
      <div className="bg-surface-container-lowest/90 backdrop-blur-glass rounded-2xl p-6 shadow-float-md w-full max-w-sm mx-4 border border-outline-variant/15">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-error" strokeWidth={1.5} />
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
            aria-label="Cancelar"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <h3 className="font-headline font-bold text-lg text-on-surface mb-1">
          Eliminar plato
        </h3>
        <p className="text-body-md text-on-surface-variant mb-6">
          ¿Seguro que quieres eliminar{" "}
          <span className="font-semibold text-on-surface">{dish.name}</span>? Esta acción
          no se puede deshacer.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 rounded-xl border border-outline-variant/20 text-on-surface-variant text-sm font-medium hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 rounded-xl bg-error text-on-error text-sm font-bold hover:brightness-95 transition-all active:scale-95 disabled:opacity-50"
          >
            {isPending ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dish Card ─────────────────────────────────────────────────────────────────

function DishCard({
  dish,
  onDelete,
  onToggle,
  isPending,
}: {
  dish: DishForClient;
  onDelete: (dish: DishForClient) => void;
  onToggle: (dish: DishForClient) => void;
  isPending: boolean;
}) {
  const status = getDishStatus(dish);
  const isInactive = status === "inactivo" || status === "fuera-de-carta";

  return (
    <div
      className={cn(
        "group relative bg-surface-container-lowest rounded-2xl overflow-hidden shadow-float",
        "hover:shadow-float-md transition-all duration-300",
        isInactive && "opacity-70 grayscale hover:opacity-100 hover:grayscale-0"
      )}
    >
      {/* Plato del día ribbon */}
      {status === "plato-del-dia" && (
        <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden z-10">
          <div className="bg-amber-400 text-[9px] font-black text-amber-900 py-1 text-center rotate-45 translate-x-5 translate-y-2 w-24 shadow-sm tracking-widest uppercase">
            HOY
          </div>
        </div>
      )}

      {/* Image — full width on mobile, thumbnail on desktop */}
      <div className="relative w-full h-44 sm:h-auto sm:w-auto sm:flex sm:gap-4 sm:p-4">
        {/* Mobile: full-width image */}
        <div className="relative h-44 w-full sm:hidden overflow-hidden bg-surface-container-high">
          {dish.photoUrl ? (
            <Image
              src={dish.photoUrl}
              alt={dish.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, 96px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UtensilsCrossed className="w-10 h-10 text-on-surface-variant/30" strokeWidth={1} />
            </div>
          )}

          {/* Status badge over image on mobile */}
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-md backdrop-blur-glass",
                STATUS_PILL[status]
              )}
            >
              {status === "plato-del-dia" && <Star className="inline w-2.5 h-2.5 mr-1 -mt-px" />}
              {status === "fuera-de-carta" && <Clock className="inline w-2.5 h-2.5 mr-1 -mt-px" />}
              {STATUS_LABELS[status]}
            </span>
          </div>

          {/* Actions button on mobile */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            <Link
              href={`/dashboard/carta/${dish.id}/editar`}
              className="w-9 h-9 bg-white/20 backdrop-blur-glass rounded-full flex items-center justify-center text-white shadow-float hover:bg-white/30 transition-colors"
              aria-label="Editar"
            >
              <Pencil className="w-4 h-4" strokeWidth={2} />
            </Link>
            <button
              onClick={() => onToggle(dish)}
              disabled={isPending}
              className="w-9 h-9 bg-white/20 backdrop-blur-glass rounded-full flex items-center justify-center text-white shadow-float hover:bg-white/30 transition-colors disabled:opacity-50"
              aria-label={dish.isActive ? "Desactivar" : "Activar"}
            >
              {dish.isActive ? (
                <EyeOff className="w-4 h-4" strokeWidth={2} />
              ) : (
                <Eye className="w-4 h-4" strokeWidth={2} />
              )}
            </button>
            <button
              onClick={() => onDelete(dish)}
              disabled={isPending}
              className="w-9 h-9 bg-white/20 backdrop-blur-glass rounded-full flex items-center justify-center text-white shadow-float hover:bg-error/70 transition-colors disabled:opacity-50"
              aria-label="Eliminar"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Desktop: row layout */}
        <div className="hidden sm:flex gap-4 p-4 w-full">
          {/* Thumbnail */}
          <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-surface-container-high">
            {dish.photoUrl ? (
              <Image
                src={dish.photoUrl}
                alt={dish.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <UtensilsCrossed className="w-8 h-8 text-on-surface-variant/30" strokeWidth={1} />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-headline font-bold text-base text-on-surface leading-snug truncate">
                  {dish.name}
                </h3>
                {(status === "fuera-de-carta" || status === "plato-del-dia") && (
                  <span
                    className={cn(
                      "shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight",
                      status === "plato-del-dia"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {status === "plato-del-dia" ? (
                      <Star className="w-2.5 h-2.5" />
                    ) : (
                      <Clock className="w-2.5 h-2.5" />
                    )}
                    {STATUS_LABELS[status]}
                  </span>
                )}
              </div>
              <p className="text-body-sm text-on-surface-variant mt-0.5 truncate">
                {dish.category?.name ?? "Sin categoría"}
                {dish.description && ` · ${dish.description}`}
              </p>
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-xl font-extrabold text-on-surface">
                {dish.price.toLocaleString("es-ES", {
                  style: "currency",
                  currency: "EUR",
                })}
              </span>
              <span
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold",
                  STATUS_PILL[status === "fuera-de-carta" ? "inactivo" : status]
                )}
              >
                {status === "fuera-de-carta"
                  ? "Inactivo"
                  : STATUS_LABELS[status === "plato-del-dia" ? "activo" : status]}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: info section */}
      <div className="sm:hidden px-4 pb-4 pt-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-headline font-bold text-base text-on-surface leading-snug">
              {dish.name}
            </h3>
            <p className="text-body-sm text-on-surface-variant mt-0.5 truncate">
              {dish.category?.name ?? "Sin categoría"}
            </p>
          </div>
          <span className="text-lg font-extrabold text-on-surface shrink-0">
            {dish.price.toLocaleString("es-ES", {
              style: "currency",
              currency: "EUR",
            })}
          </span>
        </div>
      </div>

      {/* Desktop hover actions */}
      <div className="hidden sm:flex absolute bottom-0 right-0 p-2 gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Link
          href={`/dashboard/carta/${dish.id}/editar`}
          className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors"
          aria-label="Editar"
        >
          <Pencil className="w-4 h-4" strokeWidth={1.5} />
        </Link>
        <button
          onClick={() => onToggle(dish)}
          disabled={isPending}
          className="p-2 hover:bg-surface-container-high rounded-lg text-on-surface-variant transition-colors disabled:opacity-50"
          aria-label={dish.isActive ? "Desactivar" : "Activar"}
        >
          {dish.isActive ? (
            <EyeOff className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <Eye className="w-4 h-4" strokeWidth={1.5} />
          )}
        </button>
        <button
          onClick={() => onDelete(dish)}
          disabled={isPending}
          className="p-2 hover:bg-error-container/30 rounded-lg text-error transition-colors disabled:opacity-50"
          aria-label="Eliminar"
        >
          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

// ─── Add Placeholder Card ──────────────────────────────────────────────────────

function AddPlaceholderCard() {
  return (
    <Link
      href="/dashboard/carta/nuevo"
      className={cn(
        "hidden sm:flex flex-col items-center justify-center gap-3 min-h-[160px]",
        "border-2 border-dashed border-outline-variant/30 rounded-2xl",
        "text-on-surface-variant/50 hover:border-primary/40 hover:text-primary",
        "transition-all duration-200 cursor-pointer group"
      )}
    >
      <Plus
        className="w-10 h-10 group-hover:scale-110 transition-transform"
        strokeWidth={1}
      />
      <span className="font-headline font-bold text-base">Añadir nuevo plato</span>
    </Link>
  );
}

// ─── Filter Pill ───────────────────────────────────────────────────────────────

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
        active
          ? "bg-primary text-on-primary"
          : "text-on-surface-variant hover:bg-surface-container-high"
      )}
    >
      {children}
    </button>
  );
}

// ─── Main Client Component ─────────────────────────────────────────────────────

interface CartaClientProps {
  dishes: DishForClient[];
  categories: CategoryForClient[];
}

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  { value: "plato-del-dia", label: "Plato del día" },
  { value: "fuera-de-carta", label: "Fuera de carta" },
];

export function CartaClient({ dishes, categories }: CartaClientProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("todas");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [search, setSearch] = useState("");
  const [dishToDelete, setDishToDelete] = useState<DishForClient | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return dishes.filter((dish) => {
      const status = getDishStatus(dish);

      if (categoryFilter !== "todas" && dish.category?.id !== categoryFilter) return false;
      if (statusFilter !== "todos" && status !== statusFilter) return false;
      if (
        search &&
        !dish.name.toLowerCase().includes(search.toLowerCase()) &&
        !dish.category?.name.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      return true;
    });
  }, [dishes, categoryFilter, statusFilter, search]);

  function handleToggle(dish: DishForClient) {
    startTransition(async () => {
      await toggleDishActive(dish.id);
    });
  }

  function handleDeleteConfirm() {
    if (!dishToDelete) return;
    const id = dishToDelete.id;
    setDishToDelete(null);
    startTransition(async () => {
      await deleteDish(id);
    });
  }

  return (
    <>
      {/* ── Delete modal ── */}
      {dishToDelete && (
        <DeleteModal
          dish={dishToDelete}
          onCancel={() => setDishToDelete(null)}
          onConfirm={handleDeleteConfirm}
          isPending={isPending}
        />
      )}

      <main className="p-6 md:p-10 pb-28 md:pb-10">
        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <h2 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
              Gestión de Carta
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Personaliza tu menú, ajusta precios y gestiona la disponibilidad en tiempo real.
            </p>
          </div>
          <Link
            href="/dashboard/carta/nuevo"
            className={cn(
              "inline-flex items-center justify-center gap-2 px-6 py-3.5",
              "bg-gradient-to-b from-primary to-primary-container text-on-primary",
              "font-bold rounded-xl shadow-primary-glow",
              "hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap"
            )}
          >
            <Plus className="w-5 h-5" strokeWidth={2.5} />
            Añadir plato
          </Link>
        </header>

        {/* ── Filters bar ── */}
        <section className="bg-surface-container-low rounded-2xl p-4 mb-8 flex flex-col gap-4">
          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1 shrink-0">
              Categoría
            </span>
            <FilterPill
              active={categoryFilter === "todas"}
              onClick={() => setCategoryFilter("todas")}
            >
              Todas
            </FilterPill>
            {categories.map((cat) => (
              <FilterPill
                key={cat.id}
                active={categoryFilter === cat.id}
                onClick={() => setCategoryFilter(cat.id)}
              >
                {cat.name}
              </FilterPill>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Status pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant px-1 shrink-0">
                Estado
              </span>
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <FilterPill
                  key={opt.value}
                  active={statusFilter === opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                >
                  {opt.label}
                </FilterPill>
              ))}
            </div>

            {/* Search */}
            <div className="md:ml-auto w-full md:w-64 relative shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/60" strokeWidth={1.5} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar plato…"
                className={cn(
                  "w-full pl-10 pr-4 py-2 rounded-xl text-sm",
                  "bg-surface-container-lowest border-none outline-none",
                  "focus:ring-2 focus:ring-primary-fixed-dim/40 transition-shadow"
                )}
              />
            </div>
          </div>
        </section>

        {/* ── Dish grid ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant/50 gap-4">
            <UtensilsCrossed className="w-16 h-16" strokeWidth={0.75} />
            <p className="font-headline font-bold text-xl">No hay platos</p>
            <p className="text-body-md">
              {dishes.length === 0
                ? "Añade tu primer plato para empezar."
                : "Prueba con otros filtros."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((dish) => (
              <DishCard
                key={dish.id}
                dish={dish}
                onDelete={setDishToDelete}
                onToggle={handleToggle}
                isPending={isPending}
              />
            ))}
            <AddPlaceholderCard />
          </div>
        )}
      </main>
    </>
  );
}
