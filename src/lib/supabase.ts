import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso en Client Components (browser).
 * Usa las variables públicas NEXT_PUBLIC_*.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
