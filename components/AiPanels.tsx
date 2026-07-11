"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { AqiBadge } from "./AqiBadge";

export function AiExplainCard({ districtName }: { districtName: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof api.explainPollution>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.explainPollution(districtName);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-base-600 bg-base-800 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold text-ink-100">
          Why is {districtName} polluted today?
        </h3>
        <button
          onClick={handleAsk}
          disabled={loading}
          className="rounded-md border border-signal-dim px-3 py-1 text-xs font-medium text-signal hover:bg-signal/10 disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Ask EIOS"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-aqi-poor">{error}</p>}

      {result && (
        <div className="mt-4 flex flex-col gap-2">
          <AqiBadge value={result.aqi} category={result.category} />
          <ul className="mt-1 flex flex-col gap-1.5">
            {result.reasons.map((r, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink-300">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-signal" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function TrafficSimulator({ districtName }: { districtName: string }) {
  const [reduction, setReduction] = useState(20);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleSimulate() {
    setLoading(true);
    try {
      const data = await api.simulateTraffic(districtName, reduction);
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-base-600 bg-base-800 p-5">
      <h3 className="font-display text-sm font-semibold text-ink-100">
        What if truck &amp; road traffic drops by {reduction}%?
      </h3>

      <input
        type="range"
        min={5}
        max={80}
        step={5}
        value={reduction}
        onChange={(e) => setReduction(Number(e.target.value))}
        className="mt-4 w-full accent-signal"
        aria-label="Traffic reduction percentage"
      />

      <button
        onClick={handleSimulate}
        disabled={loading}
        className="mt-3 rounded-md border border-signal-dim px-3 py-1 text-xs font-medium text-signal hover:bg-signal/10 disabled:opacity-50"
      >
        {loading ? "Simulating…" : "Run scenario"}
      </button>

      {result && !result.error && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">Current</p>
            <AqiBadge value={result.current_aqi} category={result.current_category} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">Projected</p>
            <AqiBadge value={result.projected_aqi} category={result.projected_category} />
          </div>
          <p className="col-span-2 text-xs text-ink-700">{result.assumption}</p>
        </div>
      )}
    </div>
  );
}
