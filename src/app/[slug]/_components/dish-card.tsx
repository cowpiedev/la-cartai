"use client";

import { useState } from "react";
import Image from "next/image";
import type { DishWithRelations } from "@/types";
import type { Allergen } from "@prisma/client";
import { cn, formatPrice } from "@/lib/utils";

interface DishCardProps {
  dish: DishWithRelations;
  variant: "featured" | "list" | "grid";
}

export function DishCard({ dish, variant }: DishCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const allergens = dish.allergens.map((da) => da.allergen);
  const price = formatPrice(Number(dish.price));

  return (
    <>
      {variant === "featured" && (
        <FeaturedCard
          dish={dish}
          price={price}
          hasAllergens={allergens.length > 0}
          onInfo={() => setModalOpen(true)}
        />
      )}
      {variant === "list" && (
        <ListCard
          dish={dish}
          price={price}
          hasAllergens={allergens.length > 0}
          onInfo={() => setModalOpen(true)}
        />
      )}
      {variant === "grid" && (
        <GridCard
          dish={dish}
          price={price}
          hasAllergens={allergens.length > 0}
          onInfo={() => setModalOpen(true)}
        />
      )}

      {modalOpen && (
        <AllergensModal
          dishName={dish.name}
          allergens={allergens}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

// ─── Featured Card (Platos del Día — mobile carousel) ──────────────────────

interface CardProps {
  dish: DishWithRelations;
  price: string;
  hasAllergens: boolean;
  onInfo: () => void;
}

function FeaturedCard({ dish, price, hasAllergens, onInfo }: CardProps) {
  return (
    <div className="min-w-[85%] snap-center relative rounded-3xl overflow-hidden aspect-[4/5] shadow-float group">
      {dish.photoUrl ? (
        <Image
          src={dish.photoUrl}
          alt={dish.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="85vw"
        />
      ) : (
        <div className="absolute inset-0 bg-surface-container-high flex items-center justify-center">
          <span className="text-on-surface-variant text-5xl">🍽️</span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute bottom-0 p-6 text-white w-full">
        <span className="bg-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">
          Recomendado
        </span>
        <h3 className="text-2xl font-headline font-bold mb-1 leading-tight">{dish.name}</h3>
        {dish.description && (
          <p className="text-white/80 text-sm mb-3 line-clamp-2">{dish.description}</p>
        )}
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">{price}</span>
          {hasAllergens && (
            <button
              onClick={onInfo}
              className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30 hover:bg-white/30 transition-colors"
              aria-label={`Ver alérgenos de ${dish.name}`}
            >
              <InfoIcon className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── List Card (mobile main listing) ──────────────────────────────────────

function ListCard({ dish, price, hasAllergens, onInfo }: CardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-3 flex gap-4 shadow-sm hover:shadow-float-md transition-shadow group">
      <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-surface-container-low">
        {dish.photoUrl ? (
          <Image
            src={dish.photoUrl}
            alt={dish.name}
            width={96}
            height={96}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
        )}
      </div>
      <div className="flex flex-col justify-between flex-1 py-1 min-w-0">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-bold text-on-surface leading-tight">{dish.name}</h4>
            {hasAllergens && (
              <button
                onClick={onInfo}
                className="shrink-0 text-outline hover:text-primary transition-colors"
                aria-label={`Ver alérgenos de ${dish.name}`}
              >
                <InfoIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          {dish.description && (
            <p className="text-xs text-on-surface-variant line-clamp-2 mt-1">{dish.description}</p>
          )}
        </div>
        <span className="text-primary font-bold mt-2">{price}</span>
      </div>
    </div>
  );
}

// ─── Grid Card (desktop main listing) ─────────────────────────────────────

function GridCard({ dish, price, hasAllergens, onInfo }: CardProps) {
  return (
    <div className="bg-surface-container-low/50 rounded-3xl p-4 group hover:bg-surface-container-lowest hover:shadow-float transition-all duration-300">
      <div className="h-56 rounded-2xl overflow-hidden mb-6 relative bg-surface-container">
        {dish.photoUrl ? (
          <Image
            src={dish.photoUrl}
            alt={dish.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(min-width: 1280px) 33vw, (min-width: 1024px) 50vw, 100vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
        )}
      </div>
      <div className="px-2">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h4 className="font-bold text-lg leading-tight">{dish.name}</h4>
          <span className="text-lg font-bold text-primary shrink-0">{price}</span>
        </div>
        {dish.description && (
          <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">{dish.description}</p>
        )}
        {hasAllergens && (
          <div className="flex items-center justify-end border-t border-outline-variant/20 pt-4">
            <button
              onClick={onInfo}
              className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors"
              aria-label={`Ver alérgenos de ${dish.name}`}
            >
              <InfoIcon className="w-4 h-4" />
              <span>Alérgenos</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Allergens Modal (glassmorphic) ────────────────────────────────────────

interface AllergensModalProps {
  dishName: string;
  allergens: Allergen[];
  onClose: () => void;
}

function AllergensModal({ dishName, allergens, onClose }: AllergensModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-on-surface/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass rounded-t-3xl lg:rounded-3xl w-full max-w-md p-6 pb-10 lg:pb-6 lg:mx-4 shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">
              Alérgenos
            </p>
            <h3 className="font-headline font-bold text-xl text-on-surface leading-tight">
              {dishName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-container transition-colors text-on-surface-variant"
            aria-label="Cerrar"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <ul className="space-y-2">
          {allergens.map((allergen) => (
            <li
              key={allergen.id}
              className="flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3"
            >
              <span className="text-primary font-bold text-sm">⚠</span>
              <span className="text-sm font-medium text-on-surface">{allergen.name}</span>
            </li>
          ))}
        </ul>

        <p className="text-xs text-on-surface-variant mt-4 text-center">
          Según Reglamento UE 1169/2011. Consulte con el personal ante dudas.
        </p>
      </div>
    </div>
  );
}

// ─── Icon helpers ──────────────────────────────────────────────────────────

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx={12} cy={12} r={10} />
      <line x1={12} y1={16} x2={12} y2={12} />
      <line x1={12} y1={8} x2={12.01} y2={8} />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("shrink-0", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1={18} y1={6} x2={6} y2={18} />
      <line x1={6} y1={6} x2={18} y2={18} />
    </svg>
  );
}
