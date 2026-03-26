import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "neutral" | "warning" | "premium";

const badgeColors: Record<BadgeVariant, string> = {
  success: "bg-emerald-50 text-emerald-700",
  neutral: "bg-surface-container text-on-surface-variant",
  warning: "bg-amber-50 text-amber-700",
  premium: "bg-tertiary/10 text-tertiary",
};

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg?: string;
  badge?: string;
  badgeVariant?: BadgeVariant;
}

export function MetricCard({
  title,
  value,
  icon,
  iconBg = "bg-primary/10 text-primary",
  badge,
  badgeVariant = "neutral",
}: MetricCardProps) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-3xl flex flex-col justify-between gap-6"
      style={{ boxShadow: "0 20px 40px rgba(18,28,40,0.04)" }}
    >
      <div className="flex justify-between items-start">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center",
            iconBg
          )}
        >
          {icon}
        </div>
        {badge && (
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-bold",
              badgeColors[badgeVariant]
            )}
          >
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-on-surface-variant text-sm font-medium">{title}</p>
        <h3 className="font-headline text-4xl font-extrabold text-on-surface mt-1">
          {value}
        </h3>
      </div>
    </div>
  );
}
