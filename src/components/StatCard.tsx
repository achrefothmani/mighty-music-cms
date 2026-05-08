import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  className?: string;
}

export default function StatCard({ label, value, delta, className }: StatCardProps) {
  return (
    <div className={cn("card-brutalist flex flex-col justify-between", className)}>
      <p className="text-[10px] font-mono tracking-[0.3em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-4 flex items-baseline justify-between">
        <h3 className="text-4xl font-bold tracking-tight">{value}</h3>
        {delta && (
          <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5">
            +{delta}
          </span>
        )}
      </div>
    </div>
  );
}
