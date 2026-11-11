import type { Severity } from "@/lib/types";

export const severityLabel: Record<Severity, string> = {
  1: "Low",
  2: "Moderate",
  3: "High",
};

export const severityColor: Record<Severity, string> = {
  1: "var(--color-hz-1)",
  2: "var(--color-hz-2)",
  3: "var(--color-hz-3)",
};

export function SeverityDot({ severity }: { severity: Severity }) {
  return (
    <span
      aria-hidden
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ background: severityColor[severity] }}
    />
  );
}

/** Quiet status chip: a coloured dot plus the level in mono caps. */
export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-bone/10 bg-bone/[0.05] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-bone-dim">
      <SeverityDot severity={severity} />
      {severityLabel[severity]}
    </span>
  );
}
