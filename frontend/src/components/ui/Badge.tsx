import { cn } from "../../utils/cn";
import type { StockStatus } from "../../types";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/stockStatus";

interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "indigo" | "slate";
}

export default function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", variant === "indigo" && "bg-indigo-100 text-indigo-700", variant === "slate" && "bg-slate-100 text-slate-600", className)}>
      {children}
    </span>
  );
}

export function StockBadge({ status }: { status: StockStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", STATUS_COLORS[status])}>
      <span className={cn("w-1.5 h-1.5 rounded-full", status === "in_stock" ? "bg-emerald-500" : status === "low_stock" ? "bg-amber-500" : "bg-red-500")} />
      {STATUS_LABELS[status]}
    </span>
  );
}
