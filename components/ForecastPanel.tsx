import type { ForecastResult } from "@/lib/types";
import { AqiBadge } from "./AqiBadge";

export function ForecastPanel({ forecast }: { forecast: ForecastResult }) {
  if (forecast.status !== "ok") {
    return (
      <p className="text-sm text-ink-500">
        Not enough historical data yet to forecast this district ({forecast.rows_available ?? 0} rows
        available). Try again once more history has accumulated.
      </p>
    );
  }

  const confidencePct = Math.round((forecast.confidence ?? 0) * 100);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-500">
            {forecast.horizon_hours}h ahead forecast
          </p>
          <div className="mt-1">
            <AqiBadge value={forecast.predicted_aqi ?? null} category={forecast.predicted_category ?? null} size="lg" />
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-ink-500">Confidence</p>
          <p className="font-mono text-2xl font-semibold text-signal">{confidencePct}%</p>
          <p className="text-[0.65rem] text-ink-700">from cross-validated model error</p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-ink-500">Top factors (SHAP attribution)</p>
        <ul className="flex flex-col gap-1.5">
          {forecast.top_factors?.map((f) => (
            <li key={f.feature} className="flex items-center gap-2 text-sm">
              <span className="w-40 shrink-0 text-ink-300">{f.feature}</span>
              <div className="h-1.5 flex-1 rounded-full bg-base-600">
                <div
                  className={`h-1.5 rounded-full ${f.impact >= 0 ? "bg-aqi-poor" : "bg-signal"}`}
                  style={{ width: `${Math.min(100, Math.abs(f.impact) * 8)}%` }}
                />
              </div>
              <span className="w-14 text-right font-mono text-xs text-ink-500">
                {f.impact >= 0 ? "+" : ""}
                {f.impact.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
