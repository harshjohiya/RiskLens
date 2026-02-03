import { cn } from "@/lib/utils";

interface RiskGaugeProps {
  score: number;
  label: string;
  riskLevel: "low" | "medium" | "high";
}

export function RiskGauge({ score, label, riskLevel }: RiskGaugeProps) {
  const percentage = Math.min(100, Math.max(0, score));
  const rotation = (percentage / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-48 overflow-hidden">
        {/* Background arc */}
        <div className="absolute inset-0 rounded-t-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 opacity-20" />
        
        {/* Gauge segments */}
        <div className="absolute bottom-0 left-0 right-0 h-24">
          <svg viewBox="0 0 200 100" className="h-full w-full">
            {/* Background arc */}
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-muted/30"
            />
            {/* Colored segments */}
            <path
              d="M 10 100 A 90 90 0 0 1 70 20"
              fill="none"
              stroke="hsl(var(--success))"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <path
              d="M 70 20 A 90 90 0 0 1 130 20"
              fill="none"
              stroke="hsl(var(--warning))"
              strokeWidth="12"
            />
            <path
              d="M 130 20 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="hsl(var(--destructive))"
              strokeWidth="12"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 h-20 w-1 origin-bottom -translate-x-1/2 transition-transform duration-1000 ease-out"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div className="h-16 w-1 rounded-full bg-foreground shadow-lg" />
          <div className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-foreground shadow-md" />
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-3xl font-bold">{score}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        <span
          className={cn(
            "mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium",
            riskLevel === "low" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
            riskLevel === "medium" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
            riskLevel === "high" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          )}
        >
          {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
        </span>
      </div>
    </div>
  );
}
