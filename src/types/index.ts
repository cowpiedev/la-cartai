// Tipos globales — La Carta IA
// Los tipos de BD se re-exportan desde @prisma/client para uso unificado.

export type {
  User,
  Business,
  Category,
  Dish,
  Allergen,
  DishAllergen,
  QRCode,
  UserRole,
  BusinessPlan,
  BusinessStatus,
} from "@prisma/client";

/** Fila de negocio para la tabla del panel superadmin */
export type AdminBusiness = {
  id: string;
  name: string;
  slug: string;
  plan: import("@prisma/client").BusinessPlan;
  status: import("@prisma/client").BusinessStatus;
  createdAt: string; // ISO string (serializado desde Server Component)
  owner: { email: string; name: string };
  _count: { dishes: number };
};


// ---------------------------------------------------------------------------
// Tipos de BD con relaciones precargadas (para queries habituales)
// ---------------------------------------------------------------------------

import type {
  User,
  Business,
  Category,
  Dish,
  Allergen,
} from "@prisma/client";

/** Plato con su categoría y alérgenos expandidos */
export type DishWithRelations = Dish & {
  category: Category | null;
  allergens: Array<{
    allergen: Allergen;
  }>;
};

/** Negocio con su propietario y recuento de platos */
export type BusinessWithOwner = Business & {
  owner: User;
  _count: {
    dishes: number;
    categories: number;
  };
};

/** Carta pública: negocio con categorías y platos activos */
export type PublicMenu = Business & {
  categories: Array<
    Category & {
      dishes: DishWithRelations[];
    }
  >;
  dailySpecials: DishWithRelations[];
};

// ---------------------------------------------------------------------------
// Tipos de formularios (React Hook Form + Zod inferidos en los schemas)
// ---------------------------------------------------------------------------

export interface DishFormValues {
  name: string;
  description?: string;
  recipe?: string;
  price: number;
  categoryId?: string;
  isActive: boolean;
  isDailySpecial: boolean;
  specialDate?: Date;
  allergenIds: string[];
  photoUrl?: string;
}

export interface BusinessFormValues {
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  primaryColor?: string;
}

export interface QRCodeFormValues {
  color: string;
  logoUrl?: string;
}

// ---------------------------------------------------------------------------
// Tipos de la UI
// ---------------------------------------------------------------------------

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  isPremium?: boolean;
}

export interface DashboardStats {
  activeDishes: number;
  totalCategories: number;
  dailySpecials: number;
  totalScans: number; // futuro: analytics
}

// ---------------------------------------------------------------------------
// Módulo IA de precios
// ---------------------------------------------------------------------------

export interface PriceAnalysis {
  dishName: string;
  inputPrice: number;
  marketAvg: number;
  positioning: "below" | "average" | "above";
  suggestedMin: number;
  suggestedMax: number;
  competitors: CompetitorDish[];
}

export interface CompetitorDish {
  businessName: string;
  dishName: string;
  price: number;
  distanceMeters?: number;
}

// ---------------------------------------------------------------------------
// Respuestas de Server Actions
// ---------------------------------------------------------------------------

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
