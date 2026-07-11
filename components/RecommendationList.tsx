import clsx from "clsx";
import type { Recommendation } from "@/lib/types";

const SEVERITY_STYLE: Record<Recommendation["severity"], string> = {
  info: "border-l-signal-dim",
  advisory: "border-l-aqi-moderate",
  warning: "border-l-aqi-poor",
  emergency: "border-l-aqi-severe",
};

export function RecommendationList({ recommendations }: { recommendations: Recommendation[] }) {
  if (recommendations.length === 0) {
    return <p className="text-sm text-ink-500">No active advisories for this district right now.</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {recommendations.map((rec, idx) => (
        <li
          key={idx}
          className={clsx(
            "rounded-md border-l-4 bg-base-700/60 p-3",
            SEVERITY_STYLE[rec.severity]
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              {rec.audience}
            </span>
            <span className="font-mono text-[0.65rem] uppercase text-ink-700">{rec.severity}</span>
          </div>
          <p className="mt-1 text-sm text-ink-100">{rec.action}</p>
          <p className="mt-1 text-xs text-ink-700">Basis: {rec.basis}</p>
        </li>
      ))}
    </ul>
  );
}
