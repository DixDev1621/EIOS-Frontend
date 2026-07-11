import { HomeDashboard } from "@/components/HomeDashboard";

// No `revalidate`/fetch/await anywhere in this file on purpose: the page
// shell must render immediately. All live data (national overview,
// per-state AQI, alerts, the map) is fetched client-side inside
// <HomeDashboard />, after mount -- see components/HomeDashboard.tsx.

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      {/* Hero -- fully static, no data dependency, paints instantly */}
      <section className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">
          Live environmental intelligence -- all of India
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight text-ink-100 sm:text-5xl">
          A digital twin of India&rsquo;s environment, state by state.
        </h1>
        <p className="mt-4 max-w-2xl text-ink-300">
          All 28 states and 8 union territories are mapped here. District-level live
          monitoring -- air quality, weather, fire detections, ML forecasts -- is fully
          wired up for Tamil Nadu, Kerala and Delhi today, with the rest of the country
          rolling out next (see the roadmap at the bottom of this page).
        </p>
      </section>

      <HomeDashboard />

      <section className="mt-16 border-t border-base-700 pt-8 text-xs text-ink-700">
        <p>
          District-level live monitoring currently covers Tamil Nadu (38 districts),
          Kerala (14 districts) and Delhi NCT (13 districts) -- 65 districts and
          growing. Every other state/UT above is shown with its real capital and
          summary figures today, and becomes &ldquo;Live&rdquo; the moment its district
          dataset is added -- see{" "}
          <code className="font-mono">docs/ROADMAP.md</code> for the exact, no-rewrite
          recipe.
        </p>
      </section>
    </div>
  );
}
