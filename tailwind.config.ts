import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Design System "The Digital Curator" ───────────────────────────
        // Extraído del prototipo Stitch. Usamos nombres planos para que
        // coincidan 1:1 con las clases del HTML del prototipo.

        // Primary — Terracota
        "primary":               "#8D4B00",
        "primary-container":     "#B15F00", // gradient end en botones primarios
        "primary-fixed":         "#FFDCC2",
        "primary-fixed-dim":     "#FFB77D", // focus ring de inputs
        "on-primary":            "#FFFFFF",
        "on-primary-fixed":      "#2F1500",
        "on-primary-container":  "#FFFBFF",

        // Tertiary — Azul mediterráneo
        "tertiary":              "#006096",
        "tertiary-container":    "#007ABD",
        "tertiary-fixed":        "#CEE5FF",
        "tertiary-fixed-dim":    "#96CCFF",
        "on-tertiary":           "#FFFFFF",
        "on-tertiary-container": "#FDFCFF",

        // Secondary
        "secondary":             "#82542C",
        "secondary-container":   "#FDBF8F",
        "secondary-fixed":       "#FFDCC3",
        "secondary-fixed-dim":   "#F7BA8A",
        "on-secondary":          "#FFFFFF",
        "on-secondary-container":"#784C25",

        // Surface — Fondo frío y aireado
        "surface":                    "#F8F9FF",
        "surface-bright":             "#F8F9FF",
        "surface-dim":                "#D1DBEC",
        "surface-variant":            "#D9E3F4",
        "surface-container-lowest":   "#FFFFFF",
        "surface-container-low":      "#EEF4FF",
        "surface-container":          "#E5EEFF",
        "surface-container-high":     "#DFE9FA",
        "surface-container-highest":  "#D9E3F4",
        "surface-tint":               "#904D00",

        // On-surface
        "on-surface":                 "#121C28",
        "on-surface-variant":         "#554336",
        "on-background":              "#121C28",
        "background":                 "#F8F9FF",

        // Inverse
        "inverse-surface":            "#27313E",
        "inverse-on-surface":         "#EAF1FF",
        "inverse-primary":            "#FFB77D",

        // Outline
        "outline":                    "#887364",
        "outline-variant":            "#DBC2B0",

        // Error
        "error":                      "#BA1A1A",
        "error-container":            "#FFDAD6",
        "on-error":                   "#FFFFFF",
        "on-error-container":         "#93000A",
      },
      fontFamily: {
        // Usamos las mismas claves que el prototipo
        headline: ["var(--font-manrope)", "Manrope", "sans-serif"],
        body:     ["var(--font-inter)",   "Inter",    "sans-serif"],
        label:    ["var(--font-inter)",   "Inter",    "sans-serif"],
        manrope:  ["var(--font-manrope)", "sans-serif"],
        inter:    ["var(--font-inter)",   "sans-serif"],
        sans:     ["var(--font-inter)",   "sans-serif"],
      },
      fontSize: {
        "display-lg":  ["3.5rem",  { lineHeight: "1.1",  letterSpacing: "-0.02em" }],
        "display-md":  ["2.8rem",  { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        "headline-lg": ["2rem",    { lineHeight: "1.2",  letterSpacing: "-0.01em" }],
        "headline-md": ["1.75rem", { lineHeight: "1.25", letterSpacing: "-0.008em" }],
        "headline-sm": ["1.5rem",  { lineHeight: "1.3" }],
        "title-lg":    ["1.25rem", { lineHeight: "1.4" }],
        "title-md":    ["1rem",    { lineHeight: "1.5",  fontWeight: "500" }],
        "body-lg":     ["1rem",    { lineHeight: "1.6" }],
        "body-md":     ["0.875rem",{ lineHeight: "1.5" }],
        "body-sm":     ["0.75rem", { lineHeight: "1.4" }],
        "label-lg":    ["0.875rem",{ lineHeight: "1.4",  fontWeight: "500" }],
        "label-md":    ["0.75rem", { lineHeight: "1.3",  fontWeight: "500" }],
      },
      borderRadius: {
        // Sobreescribimos los defaults para seguir el design system
        DEFAULT: "0.25rem",
        sm:      "0.375rem",
        md:      "0.5rem",
        lg:      "0.75rem",  // rounded-lg → tarjetas internas
        xl:      "1rem",     // rounded-xl → inputs, botones
        "2xl":   "1.5rem",   // rounded-2xl → cards principales
        "3xl":   "2rem",
        full:    "9999px",
      },
      boxShadow: {
        // Sombra tonal para elementos flotantes (sin sombras negras duras)
        float:    "0 20px 40px rgba(18, 28, 40, 0.04)",
        "float-md":"0 12px 24px rgba(18, 28, 40, 0.06)",
        "primary-glow": "0 8px 24px rgba(141, 75, 0, 0.20)",
        "primary-glow-lg": "0 12px 32px rgba(141, 75, 0, 0.30)",
      },
      backdropBlur: {
        glass: "16px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
