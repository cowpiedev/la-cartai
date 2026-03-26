"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQRCode } from "next-qrcode";
import {
  Building2,
  Camera,
  Check,
  Copy,
  Download,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Trash2,
  Link as LinkIcon,
  QrCode,
  Tag,
} from "lucide-react";

import { createClient } from "@/lib/supabase";
import {
  businessConfigSchema,
  type BusinessConfigValues,
} from "@/lib/validations/business";
import {
  updateBusinessConfig,
  createCategory,
  deleteCategory,
  reorderCategories,
} from "@/actions/business";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CategoryItem {
  id: string;
  name: string;
  position: number;
}

interface BusinessData {
  id: string;
  slug: string;
  name: string;
  address: string | null;
  phone: string | null;
  logoUrl: string | null;
}

interface Props {
  business: BusinessData;
  categories: CategoryItem[];
}

// ─── Sub-component: SectionHeader ─────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-headline font-bold text-on-surface text-base pl-4 border-l-4 border-primary mb-6">
      {children}
    </h2>
  );
}

// ─── Sub-component: FieldLabel ────────────────────────────────────────────────

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1"
    >
      {children}
    </label>
  );
}

// ─── Sub-component: FieldError ────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-error text-xs ml-1 mt-1">{message}</p>;
}

// ─── Sub-component: Toggle ────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative w-11 h-6 rounded-full transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim",
        checked ? "bg-primary" : "bg-outline-variant"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow",
          "transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ConfiguracionClient({ business, categories: initialCategories }: Props) {
  const { toast } = useToast();

  // ── Form ───────────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BusinessConfigValues>({
    resolver: zodResolver(businessConfigSchema),
    defaultValues: {
      name: business.name ?? "",
      address: business.address ?? "",
      phone: business.phone ?? "",
      logoUrl: business.logoUrl ?? undefined,
    },
  });

  // ── Logo state ─────────────────────────────────────────────────────────────
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "Imagen demasiado grande", description: "Máximo 2 MB" });
      return;
    }
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  // ── Save handler ───────────────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);

  async function onSave(values: BusinessConfigValues) {
    setIsSaving(true);
    try {
      let finalLogoUrl = values.logoUrl;

      if (logoFile) {
        const supabase = createClient();
        const ext = logoFile.name.split(".").pop() ?? "png";
        const path = `${business.id}/logo.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("business-logos")
          .upload(path, logoFile, { upsert: true });
        if (uploadError) throw new Error("Error al subir el logo");
        const { data: urlData } = supabase.storage
          .from("business-logos")
          .getPublicUrl(path);
        finalLogoUrl = urlData.publicUrl;
      }

      const result = await updateBusinessConfig({ ...values, logoUrl: finalLogoUrl });

      if (!result.success) {
        toast({ variant: "destructive", title: "Error al guardar", description: result.error });
        return;
      }

      toast({ title: "Configuración guardada", description: "Los cambios se han guardado correctamente." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error inesperado", description: String(err) });
    } finally {
      setIsSaving(false);
    }
  }

  // ── Public URL ─────────────────────────────────────────────────────────────
  const [copied, setCopied] = useState(false);
  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${business.slug}`
      : `lacartai.com/${business.slug}`;

  function handleCopyUrl() {
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      toast({ title: "URL copiada al portapapeles" });
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // ── QR ─────────────────────────────────────────────────────────────────────
  const [qrColor, setQrColor] = useState("#8D4B00");
  const [addLogo, setAddLogo] = useState(false);

  const { Canvas: QRCanvas } = useQRCode();

  const qrOptions = useMemo(
    () => ({
      errorCorrectionLevel: "M" as const,
      margin: 3,
      scale: 4,
      width: 180,
      color: { dark: qrColor, light: "#FFFFFF" },
    }),
    [qrColor]
  );

  const qrWrapperRef = useRef<HTMLDivElement>(null);

  function downloadQR() {
    const canvas = qrWrapperRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${business.slug}.png`;
    a.click();
  }

  // ── Categories ─────────────────────────────────────────────────────────────
  const [localCategories, setLocalCategories] = useState<CategoryItem[]>(initialCategories);
  const [newCatName, setNewCatName] = useState("");
  const [isCreatingCat, setIsCreatingCat] = useState(false);
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const draggedIdRef = useRef<string | null>(null);

  async function handleAddCategory() {
    const name = newCatName.trim();
    if (!name) return;
    setIsCreatingCat(true);
    try {
      const result = await createCategory(name);
      if (!result.success) {
        toast({ variant: "destructive", title: "Error", description: result.error });
        return;
      }
      setLocalCategories((prev) => [...prev, result.data]);
      setNewCatName("");
      toast({ title: "Categoría creada" });
    } finally {
      setIsCreatingCat(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    setDeletingCatId(id);
    try {
      const result = await deleteCategory(id);
      if (!result.success) {
        toast({ variant: "destructive", title: "Error", description: result.error });
        return;
      }
      setLocalCategories((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Categoría eliminada" });
    } finally {
      setDeletingCatId(null);
    }
  }

  function handleDragStart(id: string) {
    draggedIdRef.current = id;
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    if (draggedIdRef.current !== id) setDragOverId(id);
  }

  function handleDrop(targetId: string) {
    const draggedId = draggedIdRef.current;
    if (!draggedId || draggedId === targetId) {
      setDragOverId(null);
      return;
    }

    const updated = [...localCategories];
    const fromIdx = updated.findIndex((c) => c.id === draggedId);
    const toIdx = updated.findIndex((c) => c.id === targetId);
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);

    setLocalCategories(updated);
    setDragOverId(null);
    draggedIdRef.current = null;

    reorderCategories(updated.map((c) => c.id)).then((result) => {
      if (!result.success) {
        toast({ variant: "destructive", title: "Error al reordenar", description: result.error });
      }
    });
  }

  function handleDragEnd() {
    setDragOverId(null);
    draggedIdRef.current = null;
  }

  // ── Input class ────────────────────────────────────────────────────────────
  const inputCls = (hasError?: boolean) =>
    cn(
      "w-full bg-surface-container-low rounded-xl px-4 py-3.5",
      "text-sm font-body text-on-surface placeholder:text-on-surface-variant/50",
      "border-0 outline-none",
      "focus:ring-2 focus:ring-primary-fixed-dim focus:bg-surface-container-lowest",
      "transition-all shadow-sm",
      hasError && "ring-2 ring-error"
    );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-glass border-b border-outline-variant/15 px-4 lg:px-10 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-headline font-extrabold text-on-surface text-xl lg:text-4xl leading-tight">
              Ajustes del{" "}
              <span className="text-primary">Negocio</span>
            </h1>
            <p className="text-on-surface-variant text-xs lg:text-sm font-body mt-0.5 hidden sm:block">
              Gestiona la información pública de tu establecimiento
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              En línea
            </span>
            <button
              type="button"
              onClick={handleSubmit(onSave)}
              disabled={isSaving}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl",
                "bg-gradient-to-b from-primary to-primary-container text-on-primary",
                "font-headline font-bold text-sm",
                "shadow-primary-glow hover:shadow-primary-glow-lg",
                "active:scale-[0.98] transition-all duration-200",
                "disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
              )}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isSaving ? "Guardando…" : "Guardar cambios"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="px-4 py-6 lg:px-10 lg:py-8 pb-36 lg:pb-12">
        <form onSubmit={handleSubmit(onSave)} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ── Business data card (8 cols) ─────────────────────────── */}
            <section className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-float">
              <SectionHeader>Datos del Establecimiento</SectionHeader>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 items-start">

                {/* Logo upload */}
                <div className="sm:col-span-1 flex flex-col items-center gap-3 pt-1">
                  <div
                    onClick={() => logoInputRef.current?.click()}
                    className={cn(
                      "relative w-28 h-28 rounded-2xl overflow-hidden cursor-pointer",
                      "bg-surface-container-low",
                      "border-2 border-dashed border-outline-variant/40 hover:border-primary",
                      "transition-colors group"
                    )}
                  >
                    {logoPreview || business.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logoPreview ?? business.logoUrl!}
                        alt="Logo del negocio"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Building2
                          className="w-10 h-10 text-on-surface-variant/30"
                          strokeWidth={1}
                        />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-on-surface/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-on-primary" />
                    </div>
                  </div>

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />

                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                  >
                    Cambiar logo
                  </button>
                  <p className="text-xs text-on-surface-variant text-center leading-relaxed">
                    SVG, PNG o JPG<br />Máx 2 MB · Recomendado 512×512px
                  </p>
                </div>

                {/* Form fields */}
                <div className="sm:col-span-1 space-y-5">
                  {/* Nombre */}
                  <div className="space-y-1.5">
                    <FieldLabel htmlFor="bus-name">Nombre Comercial *</FieldLabel>
                    <input
                      id="bus-name"
                      type="text"
                      placeholder="Ej: La Terrazza Concierge"
                      className={inputCls(!!errors.name)}
                      {...register("name")}
                    />
                    <FieldError message={errors.name?.message} />
                  </div>

                  {/* Dirección */}
                  <div className="space-y-1.5">
                    <FieldLabel htmlFor="bus-address">Dirección Física *</FieldLabel>
                    <textarea
                      id="bus-address"
                      rows={2}
                      placeholder="Ej: Av. del Mar 452, Puerto Banús"
                      className={cn(inputCls(!!errors.address), "resize-none")}
                      {...register("address")}
                    />
                    <FieldError message={errors.address?.message} />
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-1.5">
                    <FieldLabel htmlFor="bus-phone">Teléfono de Contacto *</FieldLabel>
                    <input
                      id="bus-phone"
                      type="tel"
                      placeholder="+34 600 123 456"
                      className={inputCls(!!errors.phone)}
                      {...register("phone")}
                    />
                    <FieldError message={errors.phone?.message} />
                  </div>
                </div>
              </div>
            </section>

            {/* ── Right sidebar (4 cols) ──────────────────────────────── */}
            <div className="lg:col-span-4 space-y-6">

              {/* URL pública */}
              <div className="bg-tertiary rounded-2xl p-6 text-white shadow-float">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                    <LinkIcon className="w-4 h-4 text-white" />
                  </div>
                  <p className="font-headline font-bold text-sm uppercase tracking-widest text-white/80">
                    URL Pública
                  </p>
                </div>

                <p className="text-white font-headline font-extrabold text-base mb-4 leading-snug">
                  El enlace directo a tu carta digital
                </p>

                <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl px-3 py-2.5">
                  <span className="text-white/70 text-xs font-body truncate flex-1">
                    {typeof window !== "undefined"
                      ? `${window.location.host}/${business.slug}`
                      : `lacartai.com/${business.slug}`}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className={cn(
                      "flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center",
                      "bg-white/20 hover:bg-white/30 transition-colors"
                    )}
                    aria-label="Copiar URL"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                </div>

                <p className="text-white/60 text-xs font-body mt-3">
                  Comparte este enlace con tus clientes o usa el QR
                </p>
              </div>

              {/* QR module */}
              <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-float">
                <SectionHeader>
                  <span className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-primary" />
                    QR Dinámico
                  </span>
                </SectionHeader>

                {/* QR preview */}
                <div className="flex justify-center mb-5 mt-1">
                  <div className="relative p-4 bg-white rounded-2xl shadow-[0_20px_40px_rgba(18,28,40,0.08)]">
                    <div ref={qrWrapperRef} className="block rounded-lg overflow-hidden">
                      <QRCanvas
                        text={publicUrl || "https://lacartai.com"}
                        options={qrOptions}
                      />
                    </div>
                    <p className="text-center text-xs text-on-surface-variant mt-3 font-body">
                      Escanea para ver la carta
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                  {/* Color picker */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      Color del QR
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span
                        className="w-6 h-6 rounded-lg border-2 border-outline-variant/30 shadow-sm"
                        style={{ backgroundColor: qrColor }}
                      />
                      <input
                        type="color"
                        value={qrColor}
                        onChange={(e) => setQrColor(e.target.value)}
                        className="sr-only"
                        aria-label="Color del QR"
                      />
                      <span className="text-xs font-body text-on-surface-variant uppercase">
                        {qrColor}
                      </span>
                    </label>
                  </div>

                  {/* Add logo toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      Logo en el centro
                    </span>
                    <Toggle checked={addLogo} onChange={() => setAddLogo((v) => !v)} />
                  </div>
                </div>

                {/* Download button */}
                <button
                  type="button"
                  onClick={downloadQR}
                  className={cn(
                    "mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl",
                    "bg-gradient-to-b from-primary to-primary-container text-on-primary",
                    "font-headline font-bold text-sm",
                    "shadow-primary-glow hover:shadow-primary-glow-lg",
                    "active:scale-[0.98] transition-all duration-200"
                  )}
                >
                  <Download className="w-4 h-4" />
                  Descargar PNG
                </button>
              </div>
            </div>

            {/* ── Categories card (full width) ─────────────────────────── */}
            <section className="lg:col-span-12 bg-surface-container-lowest rounded-2xl p-6 lg:p-8 shadow-float">
              <SectionHeader>
                <span className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  Gestión de Categorías
                </span>
              </SectionHeader>

              {/* Category list */}
              <div className="space-y-1 mb-6 min-h-[3rem]">
                {localCategories.length === 0 && (
                  <p className="text-on-surface-variant text-sm font-body text-center py-6">
                    Aún no tienes categorías. Crea la primera abajo.
                  </p>
                )}
                {localCategories.map((cat) => (
                  <div
                    key={cat.id}
                    draggable
                    onDragStart={() => handleDragStart(cat.id)}
                    onDragOver={(e) => handleDragOver(e, cat.id)}
                    onDrop={() => handleDrop(cat.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl",
                      "transition-colors select-none",
                      dragOverId === cat.id
                        ? "bg-primary-fixed/20 ring-2 ring-primary-fixed"
                        : "hover:bg-surface-container-low"
                    )}
                  >
                    <GripVertical
                      className="w-4 h-4 text-on-surface-variant/40 cursor-grab active:cursor-grabbing flex-shrink-0"
                      strokeWidth={1.5}
                    />
                    <span className="flex-1 text-sm font-body text-on-surface">
                      {cat.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      disabled={deletingCatId === cat.id}
                      className={cn(
                        "w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0",
                        "text-on-surface-variant hover:text-error hover:bg-error/10",
                        "transition-colors disabled:opacity-50"
                      )}
                      aria-label={`Eliminar ${cat.name}`}
                    >
                      {deletingCatId === cat.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Add category input */}
              <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/10">
                <input
                  type="text"
                  placeholder="Nueva categoría (ej: Entrantes)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCategory();
                    }
                  }}
                  className={cn(
                    "flex-1 bg-surface-container-low rounded-xl px-4 py-3",
                    "text-sm font-body text-on-surface placeholder:text-on-surface-variant/50",
                    "border-0 outline-none",
                    "focus:ring-2 focus:ring-primary-fixed-dim focus:bg-surface-container-lowest",
                    "transition-all shadow-sm"
                  )}
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={isCreatingCat || !newCatName.trim()}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 rounded-xl",
                    "bg-gradient-to-b from-primary to-primary-container text-on-primary",
                    "font-headline font-bold text-sm",
                    "shadow-primary-glow hover:shadow-primary-glow-lg",
                    "active:scale-[0.98] transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                  )}
                >
                  {isCreatingCat ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">Añadir</span>
                </button>
              </div>

              <p className="text-xs text-on-surface-variant mt-3 ml-1">
                Arrastra las categorías para reordenarlas. El orden se refleja en tu carta pública.
              </p>
            </section>

          </div>
        </form>
      </main>

      {/* ── Mobile sticky save button (above bottom nav) ─────────────────── */}
      <div className="fixed bottom-24 left-0 w-full px-4 z-40 lg:hidden">
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSubmit(onSave)}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-4 rounded-xl",
            "bg-gradient-to-b from-primary to-primary-container text-on-primary",
            "font-headline font-bold",
            "shadow-2xl shadow-primary/20",
            "active:scale-[0.98] transition-all duration-200",
            "disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
          )}
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isSaving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

    </div>
  );
}
