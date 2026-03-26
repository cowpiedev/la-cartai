# La Carta IA

Plataforma SaaS para gestión de cartas digitales en negocios de hostelería. Los clientes acceden a la carta escaneando un QR o por URL pública, sin necesidad de registro.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Estilos:** Tailwind CSS + shadcn/ui
- **Base de datos:** PostgreSQL vía Supabase
- **ORM:** Prisma
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **IA:** OpenAI API + Google Maps API
- **Deploy:** Vercel

## Instalación

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd la-cartai
npm install
```

### 2. Variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase, OpenAI y Google Maps (ver comentarios en el archivo).

### 3. Base de datos

```bash
# Genera el cliente Prisma
npm run db:generate

# Aplica el schema a la base de datos (dev)
npm run db:push

# Carga los datos iniciales (14 alérgenos UE)
npx ts-node prisma/seed.ts
```

### 4. Iniciar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura de carpetas

```
src/
├── app/
│   ├── layout.tsx              # Layout raíz (fuentes, metadata)
│   ├── globals.css             # Estilos globales + Tailwind
│   ├── page.tsx                # / → Landing pública
│   ├── login/page.tsx          # /login
│   ├── register/page.tsx       # /register
│   ├── dashboard/
│   │   ├── layout.tsx          # Layout dashboard (sidebar)
│   │   ├── page.tsx            # /dashboard → Panel principal
│   │   ├── carta/
│   │   │   ├── page.tsx        # /dashboard/carta → Listado de platos
│   │   │   └── nuevo/page.tsx  # /dashboard/carta/nuevo → Alta plato
│   │   ├── ia-precios/page.tsx # /dashboard/ia-precios → IA (premium)
│   │   └── configuracion/      # /dashboard/configuracion → Config + QR
│   ├── admin/page.tsx          # /admin → Panel superadmin
│   └── [slug]/page.tsx         # /[slug] → Carta pública del negocio
├── components/
│   ├── ui/                     # Componentes shadcn/ui
│   ├── dashboard/              # Componentes del panel de gestión
│   ├── public/                 # Componentes de la carta pública
│   └── auth/                   # Componentes de autenticación
├── lib/
│   ├── supabase.ts             # Cliente Supabase (browser)
│   ├── supabase-server.ts      # Cliente Supabase (server)
│   ├── prisma.ts               # Singleton PrismaClient
│   └── utils.ts                # Utilidades (cn, formatPrice, slugify)
├── types/index.ts              # Tipos TypeScript globales
├── hooks/                      # Custom hooks
├── actions/                    # Server Actions
└── middleware.ts               # Protección de rutas
prisma/
├── schema.prisma               # Schema de la base de datos
└── seed.ts                     # Seed de alérgenos UE
```

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | Linter |
| `npm run db:generate` | Genera cliente Prisma |
| `npm run db:push` | Aplica schema a la BD (sin migración) |
| `npm run db:migrate` | Crea y aplica migración |
| `npm run db:studio` | Abre Prisma Studio (UI BD) |

## Roles de usuario

| Rol | Permisos |
|---|---|
| `superadmin` | Administra toda la plataforma |
| `owner` | Gestiona su negocio, platos y categorías |
| `staff` | Solo puede activar/desactivar platos |
| `customer` | Acceso público de solo lectura (sin login) |

## Alérgenos

Implementados los 14 alérgenos oficiales del Reglamento UE 1169/2011.
