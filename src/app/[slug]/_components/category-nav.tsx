"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface CategoryNavProps {
  categories: Category[];
  /** Variante de layout */
  variant: "pills" | "sidebar";
}

export function CategoryNav({ categories, variant }: CategoryNavProps) {
  const [activeId, setActiveId] = useState<string | null>(
    categories[0]?.id ?? null
  );

  function handleClick(id: string) {
    setActiveId(id);
    const el = document.getElementById(`cat-${id}`);
    if (el) {
      // Offset para el header sticky + category nav sticky
      const offset = variant === "pills" ? 140 : 100;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }

  if (variant === "pills") {
    return (
      <div className="hide-scrollbar flex overflow-x-auto gap-2 py-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleClick(cat.id)}
            className={cn(
              "whitespace-nowrap px-5 py-2.5 rounded-full font-semibold text-sm transition-all active:scale-95",
              activeId === cat.id
                ? "bg-primary text-on-primary shadow-primary-glow"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
    );
  }

  // sidebar variant (desktop)
  return (
    <nav className="space-y-1">
      <h3 className="font-headline font-bold text-xs text-on-surface-variant uppercase tracking-widest mb-4 px-4">
        Categorías
      </h3>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleClick(cat.id)}
          className={cn(
            "w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all",
            activeId === cat.id
              ? "bg-primary-fixed text-on-primary-fixed font-bold"
              : "text-on-surface-variant hover:bg-surface-container-low"
          )}
        >
          {cat.name}
        </button>
      ))}
    </nav>
  );
}
