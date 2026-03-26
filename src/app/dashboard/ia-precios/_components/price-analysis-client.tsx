"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Store,
  TrendingDown,
  TrendingUp,
  Minus,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateDishPrice } from "@/actions/dishes";
import { useToast } from "@/components/ui/use-toast";
import type { PriceAnalysis } from "@/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface PriceAnalysisClientProps {
  dish: Dish;
  businessAddress: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
  return n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "€";
}

function getVariancePct(price: number, marketAvg: number) {
  return ((price - marketAvg) / marketAvg) * 100;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PositioningBadge({ positioning }: { positioning: "below" | "average" | "above" }) {
  const configs = {
    below: {
      label: "Por debajo del mercado",
      className: "bg-tertiary-fixed text-tertiary",
      Icon: TrendingDown,
    },
    average: {
      label: "En la media del mercado",
      className: "bg-secondary-fixed text-secondary",
      Icon: Minus,
    },
    above: {
      label: "Por encima del mercado",
      className: "bg-error-container text-error",
      Icon: TrendingUp,
    },
  };
  const { label, className, Icon } = configs[positioning];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label-md font-label",
        className
      )}
    >
      <Icon size={13} />
      {label}
    </span>
  );
}

function PriceRangeBar({
  min,
  current,
  max,
}: {
  min: number;
  current: number;
  max: number;
}) {
  const range = max - min || 1;
  const pct = Math.min(100, Math.max(0, ((current - min) / range) * 100));
  return (
    <div className="space-y-2">
      <div className="relative h-2 rounded-full bg-surface-container-high">
        <div
          className="absolute left-0 top-0 h-2 rounded-full bg-primary/30"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-primary border-2 border-surface-container-lowest shadow-float-md"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-body-sm text-on-surface-variant">
        <span>{formatPrice(min)}</span>
        <span className="font-label-md text-on-surface">{formatPrice(current)}</span>
        <span>{formatPrice(max)}</span>
      </div>
    </div>
  );
}

function CompetitorRow({
  businessName,
  dishName,
  price,
  marketAvg,
  distanceMeters,
}: {
  businessName: string;
  dishName: string;
  price: number;
  marketAvg: number;
  distanceMeters?: number;
}) {
  const pct = getVariancePct(price, marketAvg);
  const isAbove = pct > 5;
  const isBelow = pct < -5;
  return (
    <div className="flex items-center gap-3 py-3 group hover:bg-surface-container-low rounded-xl px-3 transition-colors">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-on-surface-variant group-hover:bg-surface-container">
        <Store size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-label-lg text-on-surface truncate">{businessName}</p>
        <p className="text-body-sm text-on-surface-variant truncate">{dishName}</p>
        {distanceMeters && (
          <p className="text-body-sm text-on-surface-variant">{(distanceMeters / 1000).toFixed(1)} km</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-label-lg font-label text-on-surface">{formatPrice(price)}</p>
        {Math.abs(pct) > 1 && (
          <p
            className={cn(
              "text-body-sm",
              isAbove ? "text-error" : isBelow ? "text-tertiary" : "text-on-surface-variant"
            )}
          >
            {isAbove ? "+" : ""}
            {pct.toFixed(1)}%
          </p>
        )}
      </div>
    </div>
  );
}

function SkeletonLoading() {
  return (
    <div className="animate-pulse p-6 md:p-10 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="h-4 w-32 rounded-full bg-surface-container" />
        <div className="h-8 w-72 rounded-xl bg-surface-container" />
        <div className="h-6 w-48 rounded-full bg-surface-container" />
      </div>
      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="h-40 rounded-2xl bg-surface-container" />
          <div className="h-64 rounded-2xl bg-surface-container" />
        </div>
        <div className="lg:col-span-5 space-y-4">
          <div className="h-56 rounded-2xl bg-surface-container" />
          <div className="h-32 rounded-2xl bg-surface-container" />
          <div className="h-20 rounded-2xl bg-surface-container" />
        </div>
      </div>
    </div>
  );
}

// ─── Adjust Price Modal ────────────────────────────────────────────────────────

function AdjustPriceModal({
  dishId,
  currentPrice,
  onClose,
  onSuccess,
}: {
  dishId: string;
  currentPrice: number;
  onClose: () => void;
  onSuccess: (newPrice: number) => void;
}) {
  const { toast } = useToast();
  const [value, setValue] = useState(currentPrice.toFixed(2));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed <= 0) {
      toast({ title: "Precio inválido", variant: "destructive" });
      return;
    }
    setSaving(true);
    const result = await updateDishPrice(dishId, parsed);
    setSaving(false);
    if (result.success) {
      toast({ title: "Precio actualizado" });
      onSuccess(parsed);
    } else {
      toast({ title: result.error, variant: "destructive" });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-float space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-headline-sm text-on-surface">
            Ajustar precio
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-label-lg text-on-surface-variant">
            Nuevo precio (€)
          </label>
          <div className="flex items-center gap-2 rounded-xl bg-surface-container px-4 py-3 focus-within:ring-2 focus-within:ring-primary-fixed-dim">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="flex-1 bg-transparent text-on-surface text-body-lg outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              autoFocus
            />
            <span className="text-on-surface-variant text-label-lg">€</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-primary/20 py-2.5 text-label-lg text-on-surface hover:bg-surface-container transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-gradient-to-b from-primary to-primary-container py-2.5 text-label-lg text-on-primary flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PriceAnalysisClient({ dish, businessAddress }: PriceAnalysisClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [analysis, setAnalysis] = useState<PriceAnalysis | null>(null);
  const [currentPrice, setCurrentPrice] = useState(dish.price);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch("/api/ai/price-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dishName: dish.name,
        dishDescription: dish.description,
        price: dish.price,
        businessAddress,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: PriceAnalysis) => {
        setAnalysis(data);
        setStatus("success");
      })
      .catch(() => {
        setStatus("error");
        toast({ title: "Error al cargar el análisis de precios", variant: "destructive" });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "loading") return <SkeletonLoading />;

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-6">
        <p className="text-on-surface-variant text-body-lg">
          No se pudo cargar el análisis. Comprueba tu conexión o clave de API.
        </p>
        <Link
          href="/dashboard/carta"
          className="rounded-xl bg-gradient-to-b from-primary to-primary-container px-6 py-2.5 text-label-lg text-on-primary hover:opacity-90 transition-opacity"
        >
          Volver a la carta
        </Link>
      </div>
    );
  }

  const { positioning, suggestedMin, suggestedMax, marketAvg, competitors } = analysis!;

  // ─── CTA Buttons (reused in both layouts) ──────────────────────────────────
  const ctaButtons = (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => setIsModalOpen(true)}
        className="rounded-xl bg-gradient-to-b from-primary to-primary-container px-5 py-2.5 text-label-lg text-on-primary flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-primary-glow"
      >
        <TrendingUp size={15} />
        Ajustar precio
      </button>
      <button
        onClick={() => router.push("/dashboard/carta")}
        className="rounded-xl border border-primary/20 px-5 py-2.5 text-label-lg text-on-surface hover:bg-surface-container transition-colors"
      >
        Publicar sin cambios
      </button>
    </div>
  );

  // ─── AI Recommendation Card ────────────────────────────────────────────────
  const aiCard = (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-primary to-primary-container p-6 text-on-primary space-y-4">
      {/* Decorative blur */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5 blur-xl pointer-events-none" />

      <div className="relative flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <p className="text-label-md text-white/70 uppercase tracking-wide">Recomendación IA</p>
          <p className="text-title-lg font-headline text-white mt-0.5">
            Rango sugerido:{" "}
            <span className="font-bold underline decoration-white/40">
              {formatPrice(suggestedMin)} – {formatPrice(suggestedMax)}
            </span>
          </p>
        </div>
      </div>

      <p className="relative text-body-md text-white/80 leading-relaxed">
        Basado en {competitors.length} negocios similares en tu zona, el mercado se sitúa
        alrededor de{" "}
        <span className="text-white font-semibold">{formatPrice(marketAvg)}</span>. Ajustar
        tu precio dentro del rango sugerido puede mejorar tu posicionamiento competitivo.
      </p>

      {/* Confidence bar */}
      <div className="relative space-y-1.5">
        <div className="flex justify-between text-label-md text-white/70">
          <span>Confianza del análisis</span>
          <span>Alta</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/20">
          <div className="h-1.5 rounded-full bg-white/80" style={{ width: "78%" }} />
        </div>
      </div>
    </div>
  );

  // ─── Market Positioning Gauge ──────────────────────────────────────────────
  const positioningCard = (
    <div className="rounded-2xl bg-surface-container p-5 space-y-4">
      <h3 className="text-label-lg text-on-surface-variant uppercase tracking-wide">
        Posicionamiento en el mercado
      </h3>
      <PriceRangeBar min={suggestedMin} current={currentPrice} max={suggestedMax} />
    </div>
  );

  // ─── Mini Stats ────────────────────────────────────────────────────────────
  const statsGrid = (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl bg-surface-container p-4 space-y-1">
        <p className="text-body-sm text-on-surface-variant">Precio medio</p>
        <p className="text-headline-sm font-headline text-on-surface">{formatPrice(marketAvg)}</p>
      </div>
      <div className="rounded-2xl bg-surface-container p-4 space-y-1">
        <p className="text-body-sm text-on-surface-variant">Competidores</p>
        <p className="text-headline-sm font-headline text-on-surface">{competitors.length}</p>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Mobile Layout (< lg) ─────────────────────────────────────────── */}
      <div className="lg:hidden p-5 space-y-5 pb-10">
        {/* Label + heading */}
        <div className="space-y-1 pt-2">
          <p className="text-label-md text-tertiary uppercase tracking-widest">
            Inteligencia de precios
          </p>
          <h1 className="font-headline text-headline-md text-on-surface">Análisis IA</h1>
        </div>

        {/* Product card */}
        <div className="rounded-2xl bg-surface-container-lowest p-5 space-y-4 shadow-float">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <p className="font-headline text-title-lg text-on-surface">{dish.name}</p>
              {dish.description && (
                <p className="text-body-sm text-on-surface-variant line-clamp-2">
                  {dish.description}
                </p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="font-headline text-headline-sm text-primary">
                {formatPrice(currentPrice)}
              </p>
            </div>
          </div>
          <PositioningBadge positioning={positioning} />
          <PriceRangeBar min={suggestedMin} current={currentPrice} max={suggestedMax} />
        </div>

        {/* Competitors */}
        <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-float-md">
          <h2 className="font-headline text-title-lg text-on-surface mb-2 px-1">
            Negocios cercanos
          </h2>
          <div className="space-y-0">
            {competitors.map((c, i) => (
              <CompetitorRow
                key={i}
                businessName={c.businessName}
                dishName={c.dishName}
                price={c.price}
                marketAvg={marketAvg}
                distanceMeters={c.distanceMeters}
              />
            ))}
          </div>
        </div>

        {/* AI card with CTAs embedded */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-primary to-primary-container p-6 text-on-primary space-y-5">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="relative flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="text-label-md text-white/70">Ajuste Inteligente</p>
                <p className="font-headline text-title-lg text-white">
                  {formatPrice(suggestedMin)} – {formatPrice(suggestedMax)}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-tertiary-fixed text-tertiary px-2.5 py-1 text-label-md shrink-0">
              Recomendado
            </span>
          </div>
          <p className="relative text-body-md text-white/80">
            El mercado promedia <strong className="text-white">{formatPrice(marketAvg)}</strong>.
            Ajustar tu precio mejorará tu posicionamiento competitivo.
          </p>
          <div className="relative flex flex-col gap-2.5">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full rounded-xl bg-white/20 backdrop-blur-sm py-3 text-label-lg text-white flex items-center justify-center gap-2 hover:bg-white/25 active:scale-95 transition-all border border-white/20"
            >
              <TrendingUp size={15} />
              Aplicar precio sugerido
            </button>
            <button
              onClick={() => router.push("/dashboard/carta")}
              className="w-full rounded-xl py-3 text-label-lg text-white/80 hover:text-white transition-colors"
            >
              Publicar sin cambios
            </button>
          </div>
        </div>

        {statsGrid}
      </div>

      {/* ─── Desktop Layout (≥ lg) ────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <div className="px-10 py-8 space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <Link
              href="/dashboard/carta"
              className="inline-flex items-center gap-1.5 text-body-sm text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <ArrowLeft size={14} />
              Volver a la carta
            </Link>

            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="space-y-2">
                <p className="text-label-md text-tertiary uppercase tracking-widest">
                  Inteligencia de precios
                </p>
                <h1 className="font-headline text-headline-lg text-on-surface">{dish.name}</h1>
                <div className="flex items-center gap-3">
                  <span className="font-headline text-display-md text-primary">
                    {formatPrice(currentPrice)}
                  </span>
                  <PositioningBadge positioning={positioning} />
                </div>
              </div>
              {ctaButtons}
            </div>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left column */}
            <div className="col-span-7 space-y-5">
              {/* Dish summary */}
              <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-float space-y-2">
                <h2 className="font-headline text-title-lg text-on-surface">{dish.name}</h2>
                {dish.description && (
                  <p className="text-body-md text-on-surface-variant">{dish.description}</p>
                )}
                <p className="text-body-sm text-on-surface-variant pt-1">
                  Tu precio actual:{" "}
                  <span className="text-on-surface font-semibold">{formatPrice(currentPrice)}</span>
                  {" · "}Media del mercado:{" "}
                  <span className="text-on-surface font-semibold">{formatPrice(marketAvg)}</span>
                </p>
              </div>

              {/* Competitors */}
              <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-float-md space-y-2">
                <h2 className="font-headline text-title-lg text-on-surface mb-3">
                  Competidores cercanos
                </h2>
                <div>
                  {competitors.map((c, i) => (
                    <CompetitorRow
                      key={i}
                      businessName={c.businessName}
                      dishName={c.dishName}
                      price={c.price}
                      marketAvg={marketAvg}
                      distanceMeters={c.distanceMeters}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="col-span-5 space-y-5">
              {aiCard}
              {positioningCard}
              {statsGrid}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Adjust Price Modal ───────────────────────────────────────────── */}
      {isModalOpen && (
        <AdjustPriceModal
          dishId={dish.id}
          currentPrice={currentPrice}
          onClose={() => setIsModalOpen(false)}
          onSuccess={(newPrice) => {
            setCurrentPrice(newPrice);
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
}
