"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  LayoutDashboard,
  Building2,
  BarChart2,
  Settings,
  Shield,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/businesses", label: "Negocios", icon: Building2, exact: false },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2, exact: false },
  { href: "/admin/settings", label: "Ajustes", icon: Settings, exact: false },
];

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleLogout() {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    });
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-container-low flex flex-col z-30">
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <p className="font-headline font-extrabold text-on-surface text-sm leading-tight">
            La CartAI
          </p>
          <p className="text-xs text-on-surface-variant font-medium">
            Superadmin Console
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* System Status */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-2.5 text-xs text-on-surface-variant">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Todos los sistemas operativos
        </div>
      </div>

      {/* User card */}
      <div className="mx-3 mb-4 p-4 bg-surface-container rounded-2xl flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-extrabold text-on-primary">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate">{userName}</p>
          <p className="text-xs text-on-surface-variant">Superadmin</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={isPending}
          title="Cerrar sesión"
          className="w-8 h-8 flex items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-high transition-colors disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>
    </aside>
  );
}
