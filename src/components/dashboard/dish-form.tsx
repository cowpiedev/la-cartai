"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ChevronDown,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";

import { createClient } from "@/lib/supabase";
import { dishSchema, type DishSchemaValues } from "@/lib/validations/dish";
import { createDish, updateDish } from "@/actions/dishes";
import { useToast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AllergenItem {
  id: string;
  name: string;
  iconUrl: string;
}

interface CategoryItem {
  id: string;
  name: string;
}

interface DishFormProps {
  mode: "create" | "edit";
  dishId?: string;
  initialValues?: Partial<Omit<DishSchemaValues, "specialDate">> & {
    specialDate?: string;
  };
  categories: CategoryItem[];
  allergens: AllergenItem[];
  isPremium: boolean;
  businessId: string;
}

// ─── Sub-component: ImageUploadZone ──────────────────────────────────────────

interface ImageUploadZoneProps {
  photoUrl: string;
  preview: string | null;
  onFileSelect: (file: File) => void;
  error?: string;
}

function ImageUploadZone({
  photoUrl,
  preview,
  onFileSelect,
  error,
}: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const currentSrc = preview ?? photoUrl;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no puede superar los 5 MB");
      return;
    }
    onFileSelect(file);
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
        Fotografía del plato
      </p>
      <div
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative aspect-square w-full rounded-2xl overflow-hidden cursor-pointer",
          "border-2 border-dashed transition-colors",
          error
            ? "border-error"
            : "border-outline-variant/40 hover:border-primary",
          "bg-surface-container-low"
        )}
      >
        {currentSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentSrc}
              alt="Preview del plato"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-on-surface/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Upload className="w-8 h-8 text-on-primary mb-2" />
              <span className="text-on-primary font-headline font-bold text-sm">
                Cambiar imagen
              </span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-lowest shadow-float flex items-center justify-center">
              <Upload className="w-7 h-7 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-headline font-bold text-on-surface text-sm">
                Subir foto del plato
              </p>
              <p className="text-on-surface-variant text-xs mt-1">
                Recomendado: 1080×1080px, máx 5 MB
              </p>
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </div>
      {error && <p className="text-error text-xs ml-1">{error}</p>}
    </div>
  );
}

// ─── Sub-component: CategoryPopover ──────────────────────────────────────────

interface CategoryPopoverProps {
  categories: CategoryItem[];
  value: string | undefined;
  onChange: (id: string | undefined) => void;
}

function CategoryPopover({ categories, value, onChange }: CategoryPopoverProps) {
  const [open, setOpen] = useState(false);
  const selected = categories.find((c) => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full flex items-center justify-between",
            "bg-surface-container-lowest rounded-xl px-4 py-3.5",
            "text-sm font-body shadow-sm",
            "focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim",
            "transition-shadow"
          )}
        >
          <span className={selected ? "text-on-surface" : "text-on-surface-variant/60"}>
            {selected ? selected.name : "Sin categoría"}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-on-surface-variant transition-transform",
              open && "rotate-180"
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)]">
        <button
          type="button"
          onClick={() => { onChange(undefined); setOpen(false); }}
          className={cn(
            "w-full text-left px-3 py-2.5 rounded-xl text-sm font-body",
            "text-on-surface-variant hover:bg-surface-container-low transition-colors",
            !value && "bg-primary-fixed/50 text-on-primary-fixed font-semibold"
          )}
        >
          Sin categoría
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => { onChange(cat.id); setOpen(false); }}
            className={cn(
              "w-full text-left px-3 py-2.5 rounded-xl text-sm font-body",
              "hover:bg-surface-container-low transition-colors",
              value === cat.id
                ? "bg-primary-fixed/50 text-on-primary-fixed font-semibold"
                : "text-on-surface"
            )}
          >
            {cat.name}
          </button>
        ))}
        {categories.length === 0 && (
          <p className="px-3 py-2 text-xs text-on-surface-variant">
            No hay categorías aún. Créalas en Configuración.
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── Sub-component: AllergenGrid ─────────────────────────────────────────────

interface AllergenGridProps {
  allergens: AllergenItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

function AllergenGrid({ allergens, selectedIds, onToggle }: AllergenGridProps) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
      {allergens.map((allergen) => {
        const isSelected = selectedIds.includes(allergen.id);
        return (
          <button
            key={allergen.id}
            type="button"
            onClick={() => onToggle(allergen.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-xl",
              "transition-all duration-150 cursor-pointer",
              isSelected
                ? "bg-primary-fixed border border-primary-container/20 shadow-sm"
                : "bg-surface-container-low hover:bg-surface-container"
            )}
          >
            {allergen.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={allergen.iconUrl}
                alt=""
                className="w-6 h-6 object-contain"
              />
            ) : (
              <div className="w-6 h-6 rounded bg-outline-variant/20" />
            )}
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wide text-center leading-tight",
                isSelected ? "text-on-primary-fixed" : "text-on-surface-variant"
              )}
            >
              {allergen.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Sub-component: LoadingModal ──────────────────────────────────────────────

function LoadingModal() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 backdrop-blur-glass">
      <div className="bg-surface-container-lowest/90 backdrop-blur-glass rounded-2xl p-10 shadow-float text-center max-w-sm mx-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-5" />
        <p className="font-headline font-bold text-on-surface text-lg mb-2">
          Analizando precios con IA…
        </p>
        <p className="text-on-surface-variant text-sm font-body">
          Redirigiendo al módulo de inteligencia de precios
        </p>
      </div>
    </div>
  );
}

// ─── Main component: DishForm ────────────────────────────────────────────────

export function DishForm({
  mode,
  dishId,
  initialValues,
  categories,
  allergens,
  isPremium,
  businessId,
}: DishFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  const defaultSpecialDate =
    initialValues?.specialDate ? new Date(initialValues.specialDate) : undefined;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DishSchemaValues>({
    resolver: zodResolver(dishSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      photoUrl: initialValues?.photoUrl ?? "",
      categoryId: initialValues?.categoryId,
      price: initialValues?.price ?? (undefined as unknown as number),
      allergenIds: initialValues?.allergenIds ?? [],
      isActive: initialValues?.isActive ?? true,
      isDailySpecial: initialValues?.isDailySpecial ?? false,
      specialDate: defaultSpecialDate,
    },
  });

  const isDailySpecial = watch("isDailySpecial");
  const allergenIds = watch("allergenIds");
  const photoUrl = watch("photoUrl");

  // Revoke blob URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function handleFileSelect(file: File) {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    const url = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(url);
    setValue("photoUrl", "pending-upload", { shouldValidate: true });
  }

  function toggleAllergen(id: string) {
    const current = allergenIds ?? [];
    const next = current.includes(id)
      ? current.filter((a) => a !== id)
      : [...current, id];
    setValue("allergenIds", next);
  }

  async function onSubmit(values: DishSchemaValues) {
    setIsSubmitting(true);
    try {
      let finalPhotoUrl = values.photoUrl;

      // Upload image if a new file was selected
      if (imageFile) {
        const supabase = createClient();
        const ext = imageFile.name.split(".").pop() ?? "jpg";
        const path = `${businessId}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("dish-photos")
          .upload(path, imageFile, { upsert: true });
        if (uploadError) throw new Error("Error al subir la imagen");
        const { data: urlData } = supabase.storage
          .from("dish-photos")
          .getPublicUrl(path);
        finalPhotoUrl = urlData.publicUrl;
      }

      const payload: DishSchemaValues = { ...values, photoUrl: finalPhotoUrl };

      const result =
        mode === "create"
          ? await createDish(payload)
          : await updateDish(dishId!, payload);

      if (!result.success) {
        toast({
          variant: "destructive",
          title: "Error al guardar",
          description: result.error,
        });
        return;
      }

      if (isPremium) {
        setShowLoadingModal(true);
        setTimeout(() => {
          router.push(`/dashboard/ia-precios?dish=${result.data.id}`);
        }, 1500);
      } else {
        toast({
          title: mode === "create" ? "Plato creado" : "Plato actualizado",
          description:
            mode === "create"
              ? "El plato se ha añadido a la carta."
              : "Los cambios se han guardado correctamente.",
        });
        router.push("/dashboard/carta");
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: String(err),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const isLoading = isSubmitting || showLoadingModal;

  const ctaLabel = isPremium
    ? isLoading
      ? "Guardando…"
      : mode === "create"
      ? "Guardar y analizar precios"
      : "Actualizar y analizar precios"
    : isLoading
    ? "Guardando…"
    : mode === "create"
    ? "Guardar plato"
    : "Guardar cambios";

  return (
    <>
      {showLoadingModal && <LoadingModal />}

      <div className="min-h-screen bg-surface font-body text-on-surface">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-glass border-b border-outline-variant/15 px-6 py-4 flex items-center gap-4">
          <Link
            href="/dashboard/carta"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors"
            aria-label="Volver a la carta"
          >
            <ArrowLeft className="w-5 h-5 text-on-surface-variant" strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className="font-headline font-extrabold text-on-surface text-lg leading-tight">
              {mode === "create" ? "Nuevo plato" : "Editar plato"}
            </h1>
            <p className="text-on-surface-variant text-xs font-body">
              {mode === "create"
                ? "Añade un nuevo plato a tu carta digital"
                : "Modifica los datos del plato"}
            </p>
          </div>
        </header>

        {/* ── Content ────────────────────────────────────────────────── */}
        <main className="px-4 py-6 md:px-8 lg:px-10 pb-36 lg:pb-10">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

              {/* ── Left column ──────────────────────────────────────── */}
              <div className="lg:col-span-8 space-y-6">

                {/* Información general */}
                <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-float">
                  <h2 className="font-headline font-bold text-on-surface text-base mb-6 pl-4 border-l-4 border-primary">
                    Información general
                  </h2>

                  <div className="space-y-5">
                    {/* Nombre */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="name"
                        className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1"
                      >
                        Nombre del plato *
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Ej: Risotto de setas silvestres"
                        className={cn(
                          "w-full bg-surface-container-low rounded-xl px-4 py-3.5",
                          "text-sm font-body text-on-surface placeholder:text-on-surface-variant/50",
                          "border-0 outline-none",
                          "focus:ring-2 focus:ring-primary-fixed-dim focus:bg-surface-container-lowest",
                          "transition-all shadow-sm",
                          errors.name && "ring-2 ring-error"
                        )}
                        {...register("name")}
                      />
                      {errors.name && (
                        <p className="text-error text-xs ml-1 mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Descripción */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="description"
                        className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1"
                      >
                        Descripción / Receta *
                      </label>
                      <textarea
                        id="description"
                        rows={4}
                        placeholder="Describe los ingredientes, elaboración o notas del chef…"
                        className={cn(
                          "w-full bg-surface-container-low rounded-xl px-4 py-3.5",
                          "text-sm font-body text-on-surface placeholder:text-on-surface-variant/50",
                          "border-0 outline-none resize-none",
                          "focus:ring-2 focus:ring-primary-fixed-dim focus:bg-surface-container-lowest",
                          "transition-all shadow-sm",
                          errors.description && "ring-2 ring-error"
                        )}
                        {...register("description")}
                      />
                      {errors.description && (
                        <p className="text-error text-xs ml-1 mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    {/* Categoría y Precio — row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Categoría */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                          Categoría
                        </label>
                        <Controller
                          name="categoryId"
                          control={control}
                          render={({ field }) => (
                            <CategoryPopover
                              categories={categories}
                              value={field.value}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      </div>

                      {/* Precio */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="price"
                          className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1"
                        >
                          Precio de venta *
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-on-surface-variant font-body text-sm pointer-events-none">
                            €
                          </span>
                          <input
                            id="price"
                            type="number"
                            min={0}
                            step={0.5}
                            placeholder="0.00"
                            className={cn(
                              "w-full bg-surface-container-low rounded-xl pl-8 pr-4 py-3.5",
                              "text-sm font-body text-on-surface placeholder:text-on-surface-variant/50",
                              "border-0 outline-none",
                              "focus:ring-2 focus:ring-primary-fixed-dim focus:bg-surface-container-lowest",
                              "transition-all shadow-sm",
                              errors.price && "ring-2 ring-error"
                            )}
                            {...register("price", { valueAsNumber: true })}
                          />
                        </div>
                        {errors.price && (
                          <p className="text-error text-xs ml-1 mt-1">{errors.price.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Alérgenos */}
                <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-float">
                  <h2 className="font-headline font-bold text-on-surface text-base mb-2 pl-4 border-l-4 border-primary">
                    Alérgenos
                  </h2>
                  <p className="text-on-surface-variant text-xs font-body mb-5 ml-1">
                    Reglamento UE 1169/2011 — selecciona los presentes en el plato
                  </p>
                  <AllergenGrid
                    allergens={allergens}
                    selectedIds={allergenIds ?? []}
                    onToggle={toggleAllergen}
                  />
                </section>
              </div>

              {/* ── Right column ─────────────────────────────────────── */}
              <div className="lg:col-span-4 space-y-6">

                {/* Foto */}
                <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-float">
                  <ImageUploadZone
                    photoUrl={photoUrl ?? ""}
                    preview={imagePreview}
                    onFileSelect={handleFileSelect}
                    error={errors.photoUrl?.message}
                  />
                </section>

                {/* Visibilidad */}
                <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-float space-y-5">
                  <h2 className="font-headline font-bold text-on-surface text-base pl-4 border-l-4 border-primary">
                    Visibilidad
                  </h2>

                  {/* Toggle isActive */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-body font-semibold text-on-surface">
                        Plato activo
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Visible en la carta pública
                      </p>
                    </div>
                    <Controller
                      name="isActive"
                      control={control}
                      render={({ field }) => (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={field.value}
                          onClick={() => field.onChange(!field.value)}
                          className={cn(
                            "relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim",
                            field.value ? "bg-primary" : "bg-outline-variant"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
                              field.value ? "translate-x-5" : "translate-x-0"
                            )}
                          />
                        </button>
                      )}
                    />
                  </div>

                  {/* Toggle isDailySpecial */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-body font-semibold text-on-surface">
                        Plato del día
                      </p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Destacado en la carta
                      </p>
                    </div>
                    <Controller
                      name="isDailySpecial"
                      control={control}
                      render={({ field }) => (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={field.value}
                          onClick={() => field.onChange(!field.value)}
                          className={cn(
                            "relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim",
                            field.value ? "bg-primary" : "bg-outline-variant"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200",
                              field.value ? "translate-x-5" : "translate-x-0"
                            )}
                          />
                        </button>
                      )}
                    />
                  </div>

                  {/* Fecha de vigencia — visible solo si isDailySpecial */}
                  {isDailySpecial && (
                    <div className="bg-primary-fixed/30 rounded-xl p-4 space-y-2">
                      <label
                        htmlFor="specialDate"
                        className="block text-xs font-bold uppercase tracking-widest text-on-primary-fixed ml-1"
                      >
                        Vigencia hasta
                      </label>
                      <input
                        id="specialDate"
                        type="date"
                        className={cn(
                          "w-full bg-white/60 rounded-lg px-3 py-2 text-sm font-body text-on-surface",
                          "border-0 outline-none",
                          "focus:ring-2 focus:ring-primary-fixed-dim",
                          "transition-all",
                          errors.specialDate && "ring-2 ring-error"
                        )}
                        {...register("specialDate", {
                          setValueAs: (v) => (v ? new Date(v) : undefined),
                        })}
                      />
                      {errors.specialDate && (
                        <p className="text-error text-xs ml-1">{errors.specialDate.message}</p>
                      )}
                    </div>
                  )}
                </section>

                {/* CTA — solo desktop */}
                <div className="hidden lg:flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "w-full flex items-center justify-center gap-2",
                      "bg-gradient-to-b from-primary to-primary-container",
                      "text-on-primary font-headline font-bold py-4 rounded-xl",
                      "shadow-primary-glow hover:shadow-primary-glow-lg",
                      "active:scale-[0.98] transition-all duration-200",
                      "disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
                    )}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                    <span>{ctaLabel}</span>
                  </button>
                  <Link
                    href="/dashboard/carta"
                    className={cn(
                      "w-full flex items-center justify-center",
                      "bg-transparent border border-outline/20 rounded-xl py-3.5",
                      "text-on-surface-variant font-label text-sm font-medium",
                      "hover:bg-surface-container-low transition-colors"
                    )}
                  >
                    Descartar cambios
                  </Link>
                </div>
              </div>
            </div>
          </form>
        </main>

        {/* ── CTA móvil fijo ─────────────────────────────────────────── */}
        <div className="fixed bottom-24 left-0 w-full px-4 z-40 lg:hidden">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleSubmit(onSubmit)}
            className={cn(
              "w-full flex items-center justify-center gap-2",
              "bg-gradient-to-b from-primary to-primary-container",
              "text-on-primary font-headline font-bold py-4 rounded-xl",
              "shadow-2xl shadow-primary/20",
              "active:scale-[0.98] transition-all duration-200",
              "disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span>{ctaLabel}</span>
          </button>
        </div>
      </div>
    </>
  );
}
