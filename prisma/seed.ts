/**
 * Seed inicial — La Carta IA
 * Precarga los 14 alérgenos oficiales según Reglamento UE 1169/2011.
 *
 * Uso:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
 *
 * O configurar en package.json:
 *   "prisma": { "seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts" }
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Los iconos SVG se sirven desde /public/allergens/<slug>.svg
const ALLERGENS: { name: string; iconUrl: string }[] = [
  { name: "Gluten",              iconUrl: "/allergens/gluten.svg" },
  { name: "Crustáceos",          iconUrl: "/allergens/crustaceans.svg" },
  { name: "Huevos",              iconUrl: "/allergens/eggs.svg" },
  { name: "Pescado",             iconUrl: "/allergens/fish.svg" },
  { name: "Cacahuetes",          iconUrl: "/allergens/peanuts.svg" },
  { name: "Soja",                iconUrl: "/allergens/soybeans.svg" },
  { name: "Lácteos",             iconUrl: "/allergens/milk.svg" },
  { name: "Frutos de cáscara",   iconUrl: "/allergens/nuts.svg" },
  { name: "Apio",                iconUrl: "/allergens/celery.svg" },
  { name: "Mostaza",             iconUrl: "/allergens/mustard.svg" },
  { name: "Sésamo",              iconUrl: "/allergens/sesame.svg" },
  { name: "Sulfitos",            iconUrl: "/allergens/sulphites.svg" },
  { name: "Altramuces",          iconUrl: "/allergens/lupin.svg" },
  { name: "Moluscos",            iconUrl: "/allergens/molluscs.svg" },
];

async function main() {
  console.log("🌱 Seeding allergens...");

  for (const allergen of ALLERGENS) {
    await prisma.allergen.upsert({
      where:  { name: allergen.name },
      update: { iconUrl: allergen.iconUrl },
      create: allergen,
    });
  }

  console.log(`✓ ${ALLERGENS.length} alérgenos cargados.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
