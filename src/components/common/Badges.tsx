import type { RiskBand, Decision } from "@/types/api";
import { cn } from "@/lib/utils.ts";

interface RiskBandBadgeProps {
  band: RiskBand;
  className?: string;
}

export function RiskBandBadge({ band, className }: RiskBandBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-semibold border",
        band === "A" && "risk-band-a",
        band === "B" && "risk-band-b",
        band === "C" && "risk-band-c",
        band === "D" && "risk-band-d",
        className
      )}
    >
      Band {band}
    </span>
  );
}

interface DecisionBadgeProps {
  decision: Decision;
  className?: string;
}

export function DecisionBadge({ decision, className }: DecisionBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-semibold border",
        decision === "Approve" && "decision-approve",
        decision === "Reject" && "decision-reject",
        decision === "Manual Review" && "decision-review",
        className
      )}
    >
      {decision}
    </span>
  );
}
