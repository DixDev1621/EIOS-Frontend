"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { StateMapDatum } from "@/lib/types";
import { GEOJSON_ID_TO_STATE_CODE } from "@/lib/indiaStateGeo";
import { colorForAqi, airQualityHealthScore, NO_DATA_COLOR } from "@/lib/aqiColor";
import { LayersPanel, type LayerState } from "./LayersPanel";

const INDIA_CENTER: [number, number] = [82.8, 22.6];
const INDIA_ZOOM = 4.1;
const GEOJSON_URL = "/data/india_states_partial.geojson";

const DARK_TILES = [
  "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
];

const SATELLITE_TILES = [
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
];

function buildStyle(): maplibregl.StyleSpecification {
  return {
    version: 8,
    sources: {
      dark: {
        type: "raster",
        tiles: DARK_TILES,
        tileSize: 256,
        attribution: "© CARTO © OpenStreetMap contributors",
      },
      satellite: {
        type: "raster",
        tiles: SATELLITE_TILES,
        tileSize: 256,
        attribution: "© Esri",
      },
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#0b0f15" } },
      { id: "dark-layer", type: "raster", source: "dark" },
      { id: "satellite-layer", type: "raster", source: "satellite", layout: { visibility: "none" } },
    ],
  };
}

function popupHtml(state: StateMapDatum): string {
  const healthScore = airQualityHealthScore(state.aqi);
  const aqiText = state.aqi !== null ? `${Math.round(state.aqi)} · ${state.category}` : "No live data";
  const districtsText = state.districtCount !== null ? String(state.districtCount) : "Not live yet";
  const healthText = healthScore !== null ? String(Math.round(healthScore)) : "—";

  return `
    <div style="font-family: 'Inter', sans-serif; min-width: 180px;">
      <div style="font-weight: 600; font-size: 13px; color: #EDF2F7;">${state.name}</div>
      <div style="font-size: 11px; color: #8593A3; margin-bottom: 6px;">${state.capital}</div>
      <div style="display: grid; grid-template-columns: 1fr auto; gap: 2px 8px; font-size: 11px; color: #C3CEDA;">
        <span style="color: #8593A3;">AQI</span><span>${aqiText}</span>
        <span style="color: #8593A3;">Population</span><span>${state.population.toLocaleString("en-IN")}</span>
        <span style="color: #8593A3;">Districts</span><span>${districtsText}</span>
        <span style="color: #8593A3;">Health score</span><span>${healthText}</span>
      </div>
      <div style="margin-top: 6px; font-size: 10px; color: #49D3E8;">Click to open full dashboard →</div>
    </div>
  `;
}

export function IndiaMap({ states }: { states: StateMapDatum[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const rawGeojsonRef = useRef<any>(null);
  const stateByCodeRef = useRef<Map<string, StateMapDatum>>(new Map());

  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [layers, setLayers] = useState<LayerState>({
    aqi: true,
    boundaries: true,
    roads: true,
    satellite: false,
  });

  useEffect(() => {
    stateByCodeRef.current = new Map(states.map((s) => [s.code, s]));
  }, [states]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buildStyle(),
      center: INDIA_CENTER,
      zoom: INDIA_ZOOM,
      minZoom: 3.5,
      maxZoom: 10,
      attributionControl: false,
    });

    mapRef.current = map;
    console.log("Map initialized");

    map.addControl(new maplibregl.AttributionControl({ compact: true }));
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: false }), "top-right");
    map.addControl(new maplibregl.FullscreenControl(), "top-right");

    const popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
      maxWidth: "260px",
    });
    popupRef.current = popup;

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    resizeObserver.observe(containerRef.current);

    let hoveredFeatureId: number | string | null = null;

    function addMarkersForUnmappedStates() {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      const mappedCodes = new Set(Object.values(GEOJSON_ID_TO_STATE_CODE));

      for (const s of stateByCodeRef.current.values()) {
        if (mappedCodes.has(s.code)) continue;

        const el = document.createElement("div");
        el.style.width = "14px";
        el.style.height = "14px";
        el.style.borderRadius = "9999px";
        el.style.border = "2px solid rgba(255,255,255,0.5)";
        el.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.25)";
        el.style.cursor = "pointer";
        el.style.background = colorForAqi(s.aqi);

        el.addEventListener("mouseenter", () => {
          popup.setLngLat([s.lon, s.lat]).setHTML(popupHtml(s)).addTo(map);
        });
        el.addEventListener("mouseleave", () => {
          popup.remove();
        });
        el.addEventListener("click", () => {
          map.flyTo({ center: [s.lon, s.lat], zoom: 6.2, duration: 800 });
          window.setTimeout(() => router.push(`/state/${s.code}`), 300);
        });

        const marker = new maplibregl.Marker({ element: el }).setLngLat([s.lon, s.lat]).addTo(map);
        markersRef.current.push(marker);
      }
    }

    async function loadBoundaries() {
      try {
        const response = await fetch(GEOJSON_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch boundary data: HTTP ${response.status}`);
        }
        const geojson = await response.json();
        console.log("GeoJSON loaded");

        geojson.features.forEach((feature: any) => {
          const code = GEOJSON_ID_TO_STATE_CODE[feature.properties?.id];
          const s = code ? stateByCodeRef.current.get(code) : undefined;
          feature.properties.fillColor = s ? colorForAqi(s.aqi) : NO_DATA_COLOR;
          feature.properties.stateCode = code ?? null;
        });

        rawGeojsonRef.current = geojson;
if (map.getSource("states")) {
  setLoaded(true);
  return;
}
        map.addSource("states", { type: "geojson", data: geojson, generateId: true });

        map.addLayer({
          id: "state-fill",
          type: "fill",
          source: "states",
          paint: {
            "fill-color": ["coalesce", ["get", "fillColor"], NO_DATA_COLOR],
            "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.85, 0.6],
          },
        });

        map.addLayer({
          id: "state-outline",
          type: "line",
          source: "states",
          paint: {
            "line-color": ["case", ["boolean", ["feature-state", "hover"], false], "#49D3E8", "#0b0f15"],
            "line-width": ["case", ["boolean", ["feature-state", "hover"], false], 2.5, 1],
          },
        });

        map.on("mousemove", "state-fill", (e) => {
          if (!e.features || e.features.length === 0) return;
          map.getCanvas().style.cursor = "pointer";

          const feature = e.features[0];

          if (hoveredFeatureId !== null) {
            map.setFeatureState({ source: "states", id: hoveredFeatureId }, { hover: false });
          }
          hoveredFeatureId = feature.id ?? null;
          if (hoveredFeatureId !== null) {
            map.setFeatureState({ source: "states", id: hoveredFeatureId }, { hover: true });
          }

          const code = GEOJSON_ID_TO_STATE_CODE[feature.properties?.id];
          const s = code ? stateByCodeRef.current.get(code) : undefined;
          if (s) {
            popup.setLngLat(e.lngLat).setHTML(popupHtml(s)).addTo(map);
          }
        });

        map.on("mouseleave", "state-fill", () => {
          map.getCanvas().style.cursor = "";
          if (hoveredFeatureId !== null) {
            map.setFeatureState({ source: "states", id: hoveredFeatureId }, { hover: false });
          }
          hoveredFeatureId = null;
          popup.remove();
        });

        map.on("click", "state-fill", (e) => {
          const feature = e.features?.[0];
          const code = GEOJSON_ID_TO_STATE_CODE[feature?.properties?.id];
          if (code) {
            map.flyTo({ center: e.lngLat, zoom: 6.2, duration: 800 });
            window.setTimeout(() => router.push(`/state/${code}`), 300);
          }
        });
      } catch (err) {
        console.error("IndiaMap: failed to load boundary polygons", err);
      } finally {
  addMarkersForUnmappedStates();

  requestAnimationFrame(() => {
    map.resize();
    setLoaded(true);
  });
}
    }


let initialized = false;

const initialize = () => {
    if (initialized) return;

    if (!map.isStyleLoaded()) {
        return;
    }

    initialized = true;

    map.off("styledata", initialize);

    loadBoundaries();
};

// Fire as soon as style becomes available
map.on("styledata", initialize);

// Backup if styledata was missed
map.once("idle", initialize);

// Final fallback
const fallbackTimer = window.setTimeout(() => {
  initialize();
}, 1500);

    map.on("error", (e) => {
      console.error("IndiaMap: MapLibre error event", e && e.error ? e.error : e);
    });

    return () => {
      window.clearTimeout(fallbackTimer);
      resizeObserver.disconnect();
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      popup.remove();
      map.remove();
      mapRef.current = null;
    };
  }, [router]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded || !rawGeojsonRef.current) return;

    const source = map.getSource("states") as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    rawGeojsonRef.current.features.forEach((feature: any) => {
      const code = GEOJSON_ID_TO_STATE_CODE[feature.properties?.id];
      const s = code ? stateByCodeRef.current.get(code) : undefined;
      feature.properties.fillColor = s ? colorForAqi(s.aqi) : NO_DATA_COLOR;
    });
    source.setData(rawGeojsonRef.current);

    markersRef.current.forEach((marker) => {
      const lngLat = marker.getLngLat();
      for (const s of stateByCodeRef.current.values()) {
        if (s.lat === lngLat.lat && s.lon === lngLat.lng) {
          marker.getElement().style.background = colorForAqi(s.aqi);
          break;
        }
      }
    });
  }, [states, loaded]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;

    if (map.getLayer("dark-layer")) {
      map.setLayoutProperty("dark-layer", "visibility", layers.roads ? "visible" : "none");
    }
    if (map.getLayer("satellite-layer")) {
      map.setLayoutProperty("satellite-layer", "visibility", layers.satellite ? "visible" : "none");
    }
    if (map.getLayer("state-fill")) {
      map.setLayoutProperty("state-fill", "visibility", layers.aqi ? "visible" : "none");
    }
    if (map.getLayer("state-outline")) {
      map.setLayoutProperty("state-outline", "visibility", layers.boundaries ? "visible" : "none");
    }
  }, [layers, loaded]);

  function resetView() {
    mapRef.current?.flyTo({ center: INDIA_CENTER, zoom: INDIA_ZOOM, duration: 800 });
  }

  return (
    <div className="relative h-[75vh] min-h-[520px] w-full overflow-hidden rounded-xl border border-base-600">
      <div
        ref={containerRef}
        className="h-full w-full"
        role="img"
        aria-label="Interactive map of India colored by live district air quality"
      />

      <LayersPanel layers={layers} onChange={setLayers} />

      <button
        onClick={resetView}
        className="absolute right-3 top-[132px] z-10 rounded-md border border-base-500 bg-base-800/90 px-2.5 py-1.5 text-xs font-medium text-ink-200 shadow-panel backdrop-blur hover:border-signal hover:text-signal"
      >
        Reset view
      </button>

      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-900/60 text-sm text-ink-500">
          Loading map…
        </div>
      )}
    </div>
  );
}
