import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  TrendingUp as TrendingUpIcon,
  Store,
  Package,
  AlertTriangle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const IconMap = {
  DollarSign,
  ShoppingBag,
  TrendingUp: TrendingUpIcon,
  Store,
  Package,
  AlertTriangle,
  Users,
};

export type IconName = keyof typeof IconMap;

interface PremiumStatCardProps {
  title: string;
  value: string | number;
  iconName: IconName;
  description: string;
  trend?: number;
  delay?: number;
  alert?: boolean;
  gradient?: string;
  className?: string;
  href?: string;
}

export function PremiumStatCard({
  title,
  value,
  iconName,
  description,
  trend,
  delay = 0,
  alert = false,
  gradient,
  className,
  href,
}: PremiumStatCardProps) {
  const Icon = IconMap[iconName];

  const content = (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/50 bg-card/80 backdrop-blur-xl p-4 sm:p-6 lg:p-8 transition-all duration-500 hover:shadow-premium-hover hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-8",
        alert && "border-rose-500/30 ring-4 ring-rose-500/5 shadow-rose-500/10",
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={cn(
          "absolute -top-12 -right-12 h-32 w-32 sm:h-48 sm:w-48 rounded-full opacity-[0.03] transition-transform duration-700 group-hover:scale-150 group-hover:opacity-[0.08]",
          gradient || "bg-primary",
        )}
      />

      <div className="flex flex-col relative z-10 space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-inner transition-all duration-500 group-hover:rotate-6 group-hover:scale-110",
              alert
                ? "bg-rose-500/10 text-rose-600 shadow-rose-200"
                : "bg-primary/10 text-primary shadow-primary-200",
            )}
          >
            <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
          </div>
          {trend !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-black tracking-widest ",
                trend > 0
                  ? "text-emerald-600 bg-emerald-500/10 border border-emerald-500/20"
                  : trend < 0
                    ? "text-rose-600 bg-rose-500/10 border border-rose-500/20"
                    : "text-muted-foreground bg-secondary",
              )}
            >
              {trend > 0 ? (
                <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              ) : trend < 0 ? (
                <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              ) : null}
              {Math.abs(trend)}%
            </div>
          )}
        </div>

        <div className="space-y-1 sm:space-y-2">
          <h3 className="text-[10px] sm:text-[11px] font-black tracking-[0.2em] text-muted-foreground/60 italic">
            {title}
          </h3>
          <p className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">
            {value}
          </p>
        </div>

        <p className="text-[10px] sm:text-xs text-muted-foreground/70 font-medium leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block w-full">
        {content}
      </Link>
    );
  }

  return content;
}
