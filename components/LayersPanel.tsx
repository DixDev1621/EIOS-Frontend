"use client";

import { useState } from "react";
import clsx from "clsx";

export interface LayerState {
  aqi: boolean;
  boundaries: boolean;
  roads: boolean;
  satellite: boolean;
}

const COMING_SOON_LAYERS = [
  "District Boundaries",
  "Weather",
  "Traffic",
  "Forest Fires",
  "Industries",
  "Terrain",
];

export function LayersPanel({
  layers,
  onChange,
}: {
  layers: LayerState;
  onChange: (next: LayerState) => void;
}) {
  const [open, setOpen] = useState(true);

  function toggle(key: keyof LayerState) {
    if (key === "satellite" && !layers.satellite) {
      // Satellite and Roads are alternate basemaps -- keep it simple, only one at a time
      onChange({ ...layers, satellite: true, roads: false });
      return;
    }
    if (key === "roads" && !layers.roads) {
      onChange({ ...layers, roads: true, satellite: false });
      return;
    }
    onChange({ ...layers, [key]: !layers[key] });
  }

  return (
    <div className="absolute right-3 top-3 z-10 w-56 rounded-lg border border-base-500 bg-base-800/90 shadow-panel backdrop-blur">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-300"
      >
        Layers
        <span className="text-ink-500">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="border-t border-base-600 px-3 py-3">
          <p className="mb-1.5 text-[0.65rem] uppercase tracking-wide text-ink-700">Active</p>
          <div className="flex flex-col gap-1.5">
            <LayerToggle label="AQI choropleth" checked={layers.aqi} onClick={() => toggle("aqi")} />
            <LayerToggle label="State boundaries" checked={layers.boundaries} onClick={() => toggle("boundaries")} />
            <LayerToggle label="Roads (dark)" checked={layers.roads} onClick={() => toggle("roads")} />
            <LayerToggle label="Satellite" checked={layers.satellite} onClick={() => toggle("satellite")} />
          </div>

          <p className="mb-1.5 mt-4 text-[0.65rem] uppercase tracking-wide text-ink-700">Planned</p>
          <div className="flex flex-col gap-1.5">
            {COMING_SOON_LAYERS.map((label) => (
              <div key={label} className="flex items-center justify-between text-xs text-ink-700">
                <span>{label}</span>
                <span className="rounded-full border border-base-600 px-1.5 py-0.5 text-[0.55rem] uppercase tracking-wide">
                  Soon
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function LayerToggle({ label, checked, onClick }: { label: string; checked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between rounded-md px-1.5 py-1 text-xs text-ink-200 hover:bg-base-700"
    >
      <span>{label}</span>
      <span
        className={clsx(
          "flex h-4 w-7 items-center rounded-full px-0.5 transition-colors",
          checked ? "bg-signal-dim justify-end" : "bg-base-600 justify-start"
        )}
      >
        <span className="h-3 w-3 rounded-full bg-white" />
      </span>
    </button>
  );
}
