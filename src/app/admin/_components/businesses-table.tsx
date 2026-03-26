"use client";

import { useMemo, useState, useTransition } from "react";
import { Search, LogIn, ShieldOff, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminBusiness } from "@/types";
import type { BusinessPlan, BusinessStatus } from "@prisma/client";
import { changePlan, toggleStatus, impersonateBusiness } from "@/actions/admin";

// ─── Soft Pills ───────────────────────────────────────────────────────────────

function PlanPill({ plan }: { plan: BusinessPlan }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-xs font-bold",
        plan === "premium"
          ? "bg-tertiary/10 text-tertiary"
          : "bg-surface-container text-on-surface-variant"
      )}
    >
      {plan === "premium" ? "Premium" : "Free"}
    </span>
  );
}

function StatusPill({ status }: { status: BusinessStatus }) {
  const styles: Record<BusinessStatus, string> = {
    active: "bg-emerald-50 text-emerald-700",
    suspended: "bg-red-50 text-red-700",
    trial: "bg-primary/10 text-primary",
  };
  const labels: Record<BusinessStatus, string> = {
    active: "Activo",
    suspended: "Suspendido",
    trial: "Prueba",
  };
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", styles[status])}>
      {labels[status]}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BusinessesTable({ businesses }: { businesses: AdminBusiness[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | BusinessPlan>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | BusinessStatus>("all");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return businesses.filter((b) => {
      const matchesSearch =
        !searchQuery ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.owner.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlan = planFilter === "all" || b.plan === planFilter;
      const matchesStatus = statusFilter === "all" || b.status === statusFilter;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [businesses, searchQuery, planFilter, statusFilter]);

  function handleImpersonate(businessId: string) {
    startTransition(async () => {
      setPendingId(businessId);
      const result = await impersonateBusiness(businessId);
      if (result.success) {
        window.location.href = "/dashboard";
      }
      setPendingId(null);
    });
  }

  function handleToggleStatus(businessId: string, current: BusinessStatus) {
    const next: BusinessStatus = current === "active" ? "suspended" : "active";
    startTransition(async () => {
      setPendingId(businessId);
      await toggleStatus(businessId, next);
      setPendingId(null);
    });
  }

  function handleChangePlan(businessId: string, newPlan: BusinessPlan) {
    startTransition(async () => {
      await changePlan(businessId, newPlan);
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-headline text-xl font-extrabold text-on-surface">
            Negocios registrados
          </h2>
          <p className="text-sm text-on-surface-variant mt-0.5">
            {filtered.length} de {businesses.length} negocios
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Buscar negocio o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-surface-container-low rounded-xl text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary/30 w-64 transition-all"
            />
          </div>

          {/* Plan filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as "all" | BusinessPlan)}
            className="bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            <option value="all">Todos los planes</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | BusinessStatus)}
            className="bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="suspended">Suspendido</option>
            <option value="trial">Prueba</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden"
        style={{ boxShadow: "0 20px 40px rgba(18,28,40,0.04)" }}
      >
        {/* Header row */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-6 py-3.5 bg-surface-container-low">
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Nombre
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Plan
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Estado
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Fecha registro
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant pr-2">
            Acciones
          </span>
        </div>

        {/* Data rows */}
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-on-surface-variant text-sm">
            No se encontraron negocios con los filtros aplicados
          </div>
        ) : (
          filtered.map((b, i) => {
            const isRowPending = pendingId === b.id && isPending;
            return (
              <div
                key={b.id}
                className={cn(
                  "grid grid-cols-[2fr_1fr_1fr_1fr_auto] px-6 py-4 items-center transition-colors",
                  i % 2 === 0
                    ? "bg-surface-container-lowest"
                    : "bg-surface-container-low/40",
                  isRowPending && "opacity-60"
                )}
              >
                {/* Name + owner */}
                <div className="min-w-0 pr-4">
                  <p className="font-semibold text-on-surface text-sm truncate">
                    {b.name}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">
                    {b.owner.name} · {b.owner.email}
                  </p>
                </div>

                {/* Plan — inline select para cambio rápido */}
                <div>
                  <select
                    value={b.plan}
                    onChange={(e) =>
                      handleChangePlan(b.id, e.target.value as BusinessPlan)
                    }
                    disabled={isRowPending}
                    className="appearance-none bg-transparent text-xs cursor-pointer outline-none"
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium</option>
                  </select>
                  {/* Visual pill (no interactivo, decorativo) */}
                  <div className="mt-0.5">
                    <PlanPill plan={b.plan} />
                  </div>
                </div>

                {/* Status */}
                <StatusPill status={b.status} />

                {/* Date */}
                <span className="text-sm text-on-surface-variant">
                  {new Date(b.createdAt).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2 pl-4">
                  {isRowPending ? (
                    <Loader2 className="w-4 h-4 text-on-surface-variant animate-spin" />
                  ) : (
                    <>
                      <button
                        onClick={() => handleImpersonate(b.id)}
                        title="Ver panel del negocio"
                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-tertiary/10 text-tertiary hover:bg-tertiary/20 transition-colors"
                      >
                        <LogIn className="w-4 h-4" strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(b.id, b.status)}
                        title={b.status === "active" ? "Suspender cuenta" : "Activar cuenta"}
                        className={cn(
                          "w-8 h-8 flex items-center justify-center rounded-xl transition-colors",
                          b.status === "active"
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        )}
                      >
                        {b.status === "active" ? (
                          <ShieldOff className="w-4 h-4" strokeWidth={2} />
                        ) : (
                          <ShieldCheck className="w-4 h-4" strokeWidth={2} />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
