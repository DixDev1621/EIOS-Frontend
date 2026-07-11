"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { api, ApiError } from "@/lib/api";
import { DistrictCard } from "@/components/DistrictCard";
import { IndiaMap } from "@/components/IndiaMap";
import type { StateMapDatum, NationalOverview } from "@/lib/types";

type AlertsResponse = { count: number; alerts: any[] };

function categoryFromAqi(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

function buildInitialStateMapData(overview: NationalOverview): StateMapDatum[] {
  return overview.all_states.map((s) => ({
    code: s.code,
    name: s.name,
    capital: s.capital,
    lat: s.lat,
    lon: s.lon,
    population: s.population,
    isUnionTerritory: s.is_union_territory,
    districtDataAvailable: s.district_data_available,
    aqi: null,
    category: null,
    districtCount: null,
  }));
}

export function HomeDashboard() {
  const [overview, setOverview] = useState<NationalOverview | null>(null);
  const [alerts, setAlerts] = useState<AlertsResponse | null>(null);
  const [stateMapData, setStateMapData] = useState<StateMapDatum[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [overviewRes, alertsRes] = await Promise.all([api.getNationalOverview(), api.getAlerts()]);
        if (cancelled) return;

        setOverview(overviewRes);
        setAlerts(alertsRes);

        // Render the map immediately with capital/population data and no
        // AQI yet, rather than waiting on every live state's overview.
        setStateMapData(buildInitialStateMapData(overviewRes));
        setLoading(false);

        // Fetch each live state's AQI in the background. Each request
        // updates only its own state entry as it resolves, so one slow or
        // failed request never blocks the others -- and never blocks the
        // map, which is already on screen by this point.
        const liveCodes = overviewRes.states_with_live_data;

        await Promise.allSettled(
          liveCodes.map(async (code) => {
            try {
              const detail = await api.getStateOverview(code);
              if (cancelled) return;

              setStateMapData((prev) =>
                prev.map((s) =>
                  s.code === detail.state.code
                    ? {
                        ...s,
                        aqi: detail.average_aqi ?? null,
                        category: detail.average_aqi != null ? categoryFromAqi(detail.average_aqi) : null,
                        districtCount: detail.state.district_count ?? null,
                      }
                    : s
                )
              );
            } catch (e) {
              console.error(`HomeDashboard: failed to load overview for state ${code}`, e);
            }
          })
        );
      } catch (e) {
        if (cancelled) return;
        setFetchError(
          e instanceof ApiError
            ? `Backend responded with an error (${e.status}): ${e.message}`
            : "Could not reach the EIOS backend. Is it running at NEXT_PUBLIC_API_BASE_URL?"
        );
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-[75vh] min-h-[520px] w-full animate-pulse rounded-xl border border-base-600 bg-base-800/60" />
        <p className="text-center text-sm text-ink-500">Loading live national data…</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="rounded-lg border border-aqi-poor/40 bg-aqi-poor/10 p-5 text-sm text-ink-100">
        <p className="font-semibold">The dashboard can&rsquo;t reach live data right now.</p>
        <p className="mt-1 text-ink-300">{fetchError}</p>
        <p className="mt-2 text-ink-500">
          Start the backend (see <code className="font-mono">backend/README.md</code>) and reload
          this page.
        </p>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <>
      {/* Interactive India map -- renders with point markers/no-data colors
          immediately, then upgrades state-by-state as AQI data arrives */}
      <section className="mb-14">
        <IndiaMap states={stateMapData} />
        <p className="mt-2 text-xs text-ink-700">
          Filled states use real boundary polygons; states shown as dots don&rsquo;t have
          boundary data wired in yet and use their real capital-city coordinates instead
          -- both are hoverable and clickable. Color follows the CPCB AQI scale where live
          data exists.
        </p>
      </section>

      {/* National summary strip */}
      <section className="mb-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryStat label="States &amp; UTs" value={String(overview.states_total_in_registry)} />
        <SummaryStat label="States live" value={String(overview.states_with_live_data.length)} />
        <SummaryStat
          label="Districts monitored"
          value={`${overview.districts_reporting}/${overview.districts_total_live}`}
        />
        <SummaryStat label="Active alerts" value={String(alerts?.count ?? 0)} />
      </section>

      {alerts && alerts.count > 0 && (
        <section className="mb-14">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink-100">
            Active alerts, nationwide
          </h2>
          <ul className="flex flex-col gap-2">
            {alerts.alerts.slice(0, 6).map((a, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-md border border-base-600 bg-base-800 px-4 py-2.5 text-sm"
              >
                <span className="text-ink-100">{a.message}</span>
                <span
                  className={`font-mono text-xs uppercase ${
                    a.severity === "severe" ? "text-aqi-severe" : "text-aqi-poor"
                  }`}
                >
                  {a.severity}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Most polluted districts nationwide */}
      <section className="mb-14">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-100">
          Most polluted districts right now, nationwide
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {overview.most_polluted.map((d) => (
            <DistrictCard key={d.code} district={d} />
          ))}
        </div>
      </section>

      {/* All 36 states/UTs */}
      <section className="mb-14">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-100">
          All states &amp; union territories
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {overview.all_states
            .slice()
            .sort((a, b) => Number(b.district_data_available) - Number(a.district_data_available))
            .map((s) => (
              <Link
                key={s.code}
                href={`/state/${s.code}`}
                className={clsx(
                  "flex flex-col justify-between gap-2 rounded-lg border p-4 transition-colors",
                  s.district_data_available
                    ? "border-signal-dim bg-base-800 hover:border-signal"
                    : "border-base-600 bg-base-800/60 hover:border-base-500"
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="font-display text-sm font-semibold text-ink-100">{s.name}</span>
                  {s.district_data_available && (
                    <span className="rounded-full bg-signal/15 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wide text-signal">
                      Live
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs text-ink-500">{s.capital}</span>
              </Link>
            ))}
        </div>
      </section>
    </>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-base-600 bg-base-800 p-4">
      <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-ink-100">{value}</p>
    </div>
  );
}