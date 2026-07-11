import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { AqiBadge } from "@/components/AqiBadge";
import { StationPlot } from "@/components/StationPlot";
import { RecommendationList } from "@/components/RecommendationList";
import { ForecastPanel } from "@/components/ForecastPanel";
import { TrendChart } from "@/components/TrendChart";
import { AiExplainCard, TrafficSimulator } from "@/components/AiPanels";

export const revalidate = 900;

export default async function DistrictPage({ params }: { params: { code: string } }) {
  let dashboard;
  let forecast;
  let hourly;
  let error: string | null = null;

  try {
    [dashboard, forecast, hourly] = await Promise.all([
      api.getDistrictDashboard(params.code),
      api.getDistrictForecast(params.code),
      api.getDistrictAqiHourly(params.code),
    ]);
  } catch (e) {
    error = e instanceof ApiError ? e.message : "Could not reach the EIOS backend for this district.";
  }

  if (error || !dashboard) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink-100">District not available</h1>
        <p className="mt-2 text-ink-500">{error}</p>
        <Link href="/state/TN" className="mt-4 inline-block text-signal hover:underline">
          &larr; Back to Tamil Nadu overview
        </Link>
      </div>
    );
  }

  const { district, aqi, weather, fires, health_score, recommendations, as_of } = dashboard;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <Link href="/state/TN" className="text-xs text-ink-500 hover:text-signal">
        &larr; Tamil Nadu
      </Link>

      <header className="mt-3 mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold text-ink-100">{district.name}</h1>
          <p className="mt-1 text-sm text-ink-500">
            Headquarters: {district.headquarters}
            {district.population !== null && (
              <> &middot; Population: {district.population.toLocaleString("en-IN")}</>
            )}
            {district.area_km2 !== null && (
              <> &middot; Area: {district.area_km2.toLocaleString("en-IN")} km²</>
            )}
            {(district.population === null || district.area_km2 === null) && (
              <span className="ml-1 text-ink-700">(figures pending official publication)</span>
            )}
          </p>
        </div>
        <p className="font-mono text-xs text-ink-700">
          {as_of ? `As of ${as_of.replace("T", " ")} IST` : ""}
        </p>
      </header>

      {/* Top row: station plot + health score + AQI sub-indices */}
      <section className="mb-12 grid gap-6 lg:grid-cols-3">
        <div className="rounded-lg border border-base-600 bg-base-800 p-6">
          <p className="mb-4 text-center text-xs uppercase tracking-wide text-ink-500">
            Current conditions
          </p>
          <StationPlot
            aqi={aqi.value}
            category={aqi.category}
            windSpeedKmh={weather.wind_speed_kmh}
            temperatureC={weather.temperature_c}
            humidityPct={weather.humidity_pct}
            precipitationMm={weather.precipitation_mm}
          />
        </div>

        <div className="rounded-lg border border-base-600 bg-base-800 p-6">
          <p className="mb-3 text-xs uppercase tracking-wide text-ink-500">
            Environmental Health Score
          </p>
          <p className="font-display text-5xl font-semibold text-ink-100">{health_score.score}</p>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <ScoreBar label="Air quality" value={health_score.air_quality_component} />
            <ScoreBar label="Weather stress" value={health_score.weather_stress_component} />
            <ScoreBar label="Fire load" value={health_score.fire_load_component} />
          </div>
        </div>

        <div className="rounded-lg border border-base-600 bg-base-800 p-6">
          <p className="mb-3 text-xs uppercase tracking-wide text-ink-500">Pollutant sub-indices</p>
          <ul className="flex flex-col gap-2 font-mono text-sm">
            {Object.entries(aqi.sub_indices).map(([pollutant, value]) => (
              <li key={pollutant} className="flex justify-between text-ink-300">
                <span className="uppercase text-ink-500">{pollutant}</span>
                <span>{value.toFixed(0)}</span>
              </li>
            ))}
            {Object.keys(aqi.sub_indices).length === 0 && (
              <li className="text-ink-500">No pollutant data available right now.</li>
            )}
          </ul>
          <p className="mt-3 text-xs text-ink-700">
            Dominant pollutant: {aqi.dominant_pollutant?.toUpperCase() ?? "n/a"}
          </p>
        </div>
      </section>

      {/* Trend + forecast */}
      <section className="mb-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-base-600 bg-base-800 p-6">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink-100">
            PM2.5 -- last 48h &amp; next 48h forecast
          </h2>
          {hourly?.hourly?.time ? (
            <TrendChart time={hourly.hourly.time} pm25={hourly.hourly.pm2_5} />
          ) : (
            <p className="text-sm text-ink-500">Hourly series unavailable.</p>
          )}
        </div>

        <div className="rounded-lg border border-base-600 bg-base-800 p-6">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink-100">
            AI forecast &amp; explainability
          </h2>
          {forecast && <ForecastPanel forecast={forecast} />}
        </div>
      </section>

      {/* Recommendations + AI panels */}
      <section className="mb-12 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-base-600 bg-base-800 p-6">
          <h2 className="mb-4 font-display text-sm font-semibold text-ink-100">
            Recommendations
          </h2>
          <RecommendationList recommendations={recommendations} />
        </div>

        <div className="flex flex-col gap-6">
          <AiExplainCard districtName={district.name} />
          <TrafficSimulator districtName={district.name} />
        </div>
      </section>

      {/* Fire detections */}
      <section className="mb-12">
        <h2 className="mb-4 font-display text-sm font-semibold text-ink-100">
          Active fire / thermal detections (72h, 100km radius)
        </h2>
        {!fires.configured ? (
          <p className="rounded-md border border-base-600 bg-base-800 p-4 text-sm text-ink-500">
            {fires.message}
          </p>
        ) : fires.detections.length === 0 ? (
          <p className="text-sm text-ink-500">No active fire detections nearby.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-base-600">
            <table className="w-full text-left text-sm">
              <thead className="bg-base-700 text-xs uppercase text-ink-500">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Time (UTC)</th>
                  <th className="px-4 py-2">Confidence</th>
                  <th className="px-4 py-2">FRP (MW)</th>
                  <th className="px-4 py-2">Day/Night</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-700">
                {fires.detections.slice(0, 20).map((f, i) => (
                  <tr key={i} className="text-ink-300">
                    <td className="px-4 py-2 font-mono">{f.acquired_date}</td>
                    <td className="px-4 py-2 font-mono">{f.acquired_time}</td>
                    <td className="px-4 py-2">{f.confidence}</td>
                    <td className="px-4 py-2 font-mono">{f.frp_mw?.toFixed(1) ?? "—"}</td>
                    <td className="px-4 py-2">{f.day_night}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-ink-500">
        <span>{label}</span>
        <span className="font-mono">{value.toFixed(0)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-base-600">
        <div className="h-1.5 rounded-full bg-signal" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
