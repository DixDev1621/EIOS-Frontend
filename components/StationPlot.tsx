const CATEGORY_TEXT_COLOR: Record<string, string> = {
  Good: "text-aqi-good",
  Satisfactory: "text-aqi-satisfactory",
  Moderate: "text-aqi-moderate",
  Poor: "text-aqi-poor",
  "Very Poor": "text-aqi-verypoor",
  Severe: "text-aqi-severe",
};

export function StationPlot({
  aqi,
  category,
  windSpeedKmh,
  temperatureC,
  humidityPct,
  precipitationMm,
}: {
  aqi: number | null;
  category: string | null;
  windSpeedKmh: number | null;
  temperatureC: number | null;
  humidityPct: number | null;
  precipitationMm: number | null;
}) {
  const colorClass = category ? CATEGORY_TEXT_COLOR[category] ?? "text-ink-100" : "text-ink-500";

  return (
    <div className="station-plot w-full max-w-[220px] mx-auto">
      <div className="station-readout station-readout--n">
        {temperatureC !== null ? `${temperatureC.toFixed(0)}°C` : "—"}
      </div>
      <div className="station-readout station-readout--e">
        {windSpeedKmh !== null ? `${windSpeedKmh.toFixed(0)} km/h` : "—"}
      </div>
      <div className="station-readout station-readout--s">
        {precipitationMm !== null ? `${precipitationMm.toFixed(1)} mm` : "0.0 mm"}
      </div>
      <div className="station-readout station-readout--w">
        {humidityPct !== null ? `${humidityPct.toFixed(0)}% RH` : "—"}
      </div>

      <div className="flex flex-col items-center">
        <span className={`font-display text-4xl font-bold ${colorClass}`}>
          {aqi !== null ? Math.round(aqi) : "—"}
        </span>
        <span className="text-[0.65rem] uppercase tracking-widest text-ink-500 mt-1">
          {category ?? "no data"}
        </span>
      </div>
    </div>
  );
}
