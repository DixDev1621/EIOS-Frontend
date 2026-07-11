"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { DistrictQuickStatus } from "@/lib/types";

const CATEGORY_HEX: Record<string, string> = {
  Good: "#3FA96A",
  Satisfactory: "#A0CE4E",
  Moderate: "#F2C230",
  Poor: "#F2883B",
  "Very Poor": "#E2483E",
  Severe: "#8D1B3D",
};

export function MapView({
  districts,
  centerLat = 22.9734,
  centerLon = 78.6569,
  zoom = 4.4,
}: {
  districts: DistrictQuickStatus[];
  centerLat?: number;
  centerLon?: number;
  zoom?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {},
        layers: [],
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
      },
      center: [centerLon, centerLat],
      zoom,
      attributionControl: false,
    });

    map.getContainer().style.background = "#0b0f15";
    mapRef.current = map;

    map.on("load", () => {
      districts.forEach((d) => {
        const el = document.createElement("div");
        el.style.width = "12px";
        el.style.height = "12px";
        el.style.borderRadius = "9999px";
        el.style.border = "1px solid rgba(255,255,255,0.35)";
        el.style.background = d.category ? CATEGORY_HEX[d.category] ?? "#5B6675" : "#5B6675";
        el.style.cursor = "pointer";
        el.title = `${d.name}: AQI ${d.aqi ?? "n/a"} (${d.category ?? "no data"})`;

        el.addEventListener("click", () => {
          window.location.href = `/district/${d.code}`;
        });

        new maplibregl.Marker({ element: el }).setLngLat([d.lon, d.lat]).addTo(map);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [districts, centerLat, centerLon, zoom]);

  return (
    <div
      ref={containerRef}
      className="h-[420px] w-full overflow-hidden rounded-lg border border-base-600"
      role="img"
      aria-label="Map of districts colored by current air quality"
    />
  );
}
