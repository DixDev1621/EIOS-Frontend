import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { MapView } from "@/components/MapView";
import { DistrictCard } from "@/components/DistrictCard";

export const revalidate = 900;

export default async function StatePage({ params }: { params: { code: string } }) {
  let overview;
  let stateDetail;
  let notLiveYet = false;
  let error: string | null = null;

  try {
    overview = await api.getStateOverview(params.code);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      notLiveYet = true;
      try {
        stateDetail = await api.getState(params.code);
      } catch (e2) {
        error = e2 instanceof ApiError ? e2.message : "Could not reach the EIOS backend.";
      }
    } else {
      error = e instanceof ApiError ? e.message : "Could not reach the EIOS backend for this state.";
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink-100">State not available</h1>
        <p className="mt-2 text-ink-500">{error}</p>
        <Link href="/" className="mt-4 inline-block text-signal hover:underline">
          &larr; Back to national overview
        </Link>
      </div>
    );
  }

  // --- Not-yet-live state: show a capital-only reference view, honestly ---
  if (notLiveYet && stateDetail) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className="text-xs text-ink-500 hover:text-signal">
          &larr; National overview
        </Link>
        <h1 className="mt-3 font-display text-4xl font-semibold text-ink-100">{stateDetail.name}</h1>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat label="Capital" value={stateDetail.capital} />
          <Stat label="Area" value={`${stateDetail.area_km2.toLocaleString("en-IN")} km²`} />
          <Stat label="Population (2011 Census)" value={stateDetail.population.toLocaleString("en-IN")} />
        </div>
        <div className="mt-8 rounded-lg border border-base-600 bg-base-800 p-6">
          <p className="text-sm text-ink-300">
            District-level live monitoring (AQI, weather, fire detections, ML forecasts) isn&rsquo;t
            wired in for {stateDetail.name} yet. It&rsquo;s currently live for Tamil Nadu, Kerala and
            Delhi.
          </p>
          <p className="mt-2 text-xs text-ink-500">
            Adding it is a data file, not a rewrite -- see{" "}
            <code className="font-mono">docs/ROADMAP.md</code> for the exact recipe used for the
            three live states.
          </p>
        </div>
      </div>
    );
  }

  if (!overview) {
    return null;
  }

  const { state } = overview;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link href="/" className="text-xs text-ink-500 hover:text-signal">
        &larr; National overview
      </Link>

      <header className="mt-3 mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">State overview</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-ink-100">{state.name}</h1>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Capital" value={state.capital} />
          <Stat label="Districts" value={String(state.district_count)} />
          <Stat label="Area" value={`${state.area_km2.toLocaleString("en-IN")} km²`} />
          <Stat label="Population" value={state.population.toLocaleString("en-IN")} />
        </div>
      </header>

      <section className="mb-12">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-100">
          District air quality map
        </h2>
        <MapView districts={overview.all_districts} />
        <p className="mt-2 text-xs text-ink-700">
          Marker color follows the CPCB National AQI category. Click a district to open its full
          dashboard.
        </p>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-100">
            All {state.district_count} districts
          </h2>
          <span className="font-mono text-xs text-ink-500">
            State average AQI: {overview.average_aqi?.toFixed(0) ?? "—"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {overview.all_districts
            .slice()
            .sort((a, b) => (b.aqi ?? 0) - (a.aqi ?? 0))
            .map((d) => (
              <DistrictCard key={d.code} district={d} />
            ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-base-600 bg-base-800 p-4">
      <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-ink-100">{value}</p>
    </div>
  );
}
