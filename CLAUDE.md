# CLAUDE.md — Carta Digital SaaS (Hostelería)

## Descripción del proyecto
Plataforma SaaS web responsive para gestión de cartas digitales en negocios de hostelería.
Los clientes acceden a la carta vía QR o URL pública sin necesidad de registro.

## Stack tecnológico
- Framework: Next.js 14 con App Router
- Estilos: Tailwind CSS + shadcn/ui
- Base de datos: PostgreSQL vía Supabase
- ORM: Prisma
- Autenticación: Supabase Auth
- Storage de imágenes: Supabase Storage
- IA: OpenAI API (análisis de precios) + Google Maps API (negocios cercanos)
- Deploy: Vercel

## Tipos de usuario
- `superadmin`: administra toda la plataforma
- `owner`: gestor de un negocio (puede crear platos, categorías, ver análisis)
- `staff`: empleado con acceso limitado (puede ver y activar/desactivar platos)
- `customer`: cliente final (acceso público sin login, solo lectura)

## Estructura de rutas principal
- `/` → landing pública de la plataforma
- `/login` `/register` → autenticación
- `/dashboard` → panel del owner/staff
- `/dashboard/carta` → gestión de platos
- `/dashboard/carta/nuevo` → formulario alta de plato
- `/dashboard/ia-precios` → módulo análisis IA
- `/dashboard/configuracion` → datos negocio + QR
- `/admin` → panel superadmin
- `/[slug]` → carta pública del negocio (ej: /el-rincon-de-paco)

## Convenciones de código
- Componentes en PascalCase, archivos en kebab-case
- Usar siempre Server Components por defecto, Client Components solo si hay interactividad
- Formularios con React Hook Form + Zod para validación
- Llamadas a API siempre tipadas con TypeScript
- Variables de entorno en `.env.local`, nunca hardcodeadas

## Design System — "The Digital Curator" (extraído de hearth_slate/DESIGN.md)

### Filosofía general
UI editorial de alta gama inspirada en el lujo hotelero. Espacios amplios, capas tonales, sin líneas explícitas. Evitar el look "dense dashboard" de SaaS genérico.

### Paleta de colores
- **Primary:** `#8D4B00` (Terracotta) → acciones principales, CTAs
- **Surface / Background:** `#F8F9FF` → base fría y aireada
- **Tertiary:** `#006096` (Azul mediterráneo) → datos secundarios, info
- **Text principal:** `#121C28` (`on_surface`) → nunca usar negro puro `#000`

### Regla "No-Line"
**NUNCA usar bordes `1px solid` para separar secciones.** La estructura se define exclusivamente mediante cambios de color de fondo:
- Nav lateral → `surface_container_low`
- Workspace principal → `surface`
- Módulos destacados → `surface_container_high`
- Si un borde es imprescindible por accesibilidad → `outline_variant` al **15% de opacidad** máximo

### Glassmorphism
Para elementos flotantes (modales, popovers): fondo `surface_container_lowest` semi-transparente + `backdrop-blur` de 12px–16px.

### Tipografía
- **Manrope** → títulos y display (editorial). `display-lg`: 3.5rem, `headline-md`: 1.75rem, letter-spacing ajustado
- **Inter** → cuerpo y etiquetas (workhorse). `body-md`: 0.875rem
- Ratio mínimo titular/cuerpo: **2:1**

### Elevación y profundidad
Sin sombras tradicionales. Jerarquía mediante capas tonales:
- Sombra para elementos flotantes: `Y: 20px, Blur: 40px, Color: #121C28 al 4% opacidad`

### Componentes clave
- **Botones primarios:** gradiente `primary` → `primary_container` (top-bottom), border-radius `0.75rem`. En hover: intensificar gradiente, no cambiar color
- **Botones secundarios:** sin fondo, ghost border al 20% opacidad
- **Inputs:** fondo `surface_container_lowest`, sin borde. Focus: outer glow 2px de `primary_fixed` + fondo transiciona a `surface`
- **Cards:** `rounded-lg` (1rem). **Prohibido usar divisores horizontales** entre items de lista; usar espacio vertical (`spacing-4` o `spacing-6`) y zebra striping con `surface_container_low`
- **Status badges:** "Soft Pills" totalmente redondeadas
- **Dropdowns:** NO usar `<select>` nativo. Usar popovers custom con glassmorphism

### Layout y espaciado
- Márgenes asimétricos en headers de dashboard (ej: 8rem izquierda, 4rem derecha) para look editorial
- Border-radius de contenedores grandes: `xl` (1.5rem), nunca el default de 8px
- Si una pantalla se ve "cargada": aumentar espaciado, no añadir líneas

## Notas importantes
- Los prototipos HTML de referencia están en stitch-prototypes\ (ruta completa: C:\dev\pers\cowpiedev\la-cartai\la-cartai\stitch-prototypes)
- Respetar fielmente la estructura visual de los prototipos al crear componentes
- Los alérgenos siguen el reglamento UE 1169/2011 (14 alérgenos oficiales)
- El módulo de IA es una feature premium (flag: `plan === 'premium'`)