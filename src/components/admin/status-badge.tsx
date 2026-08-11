import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  processing: "bg-accent-purple/15 text-accent-purple",
  shipped: "bg-accent-cyan/15 text-accent-cyan",
  delivered: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-accent-red/15 text-accent-red",
  healthy: "bg-emerald-500/15 text-emerald-400",
  low: "bg-amber-500/15 text-amber-400",
  out: "bg-accent-red/15 text-accent-red",
  active: "bg-emerald-500/15 text-emerald-400",
  inactive: "bg-surface-2 text-ink-faint",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
        styles[status] ?? "bg-surface-2 text-ink-faint"
      )}
    >
      {status}
    </span>
  );
}
