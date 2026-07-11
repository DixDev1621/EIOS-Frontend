/**
 * CPCB AQI category color scale, matching backend app/services/aqi_calculator.py.
 */
export const AQI_CATEGORY_COLOR: Record<string, string> = {
  Good: "#3FA96A",
  Satisfactory: "#A0CE4E",
  Moderate: "#F2C230",
  Poor: "#F2883B",
  "Very Poor": "#E2483E",
  Severe: "#8D1B3D",
};

export const NO_DATA_COLOR = "#3A4657";

export function categoryFromAqi(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Satisfactory";
  if (aqi <= 200) return "Moderate";
  if (aqi <= 300) return "Poor";
  if (aqi <= 400) return "Very Poor";
  return "Severe";
}

export function colorForAqi(aqi: number | null): string {
  if (aqi === null) return NO_DATA_COLOR;
  return AQI_CATEGORY_COLOR[categoryFromAqi(aqi)] ?? NO_DATA_COLOR;
}

/**
 * Mirrors the air-quality component of the backend's Environmental Health
 * Score (app/services/health_score_service.py::_air_quality_component) --
 * same real, documented formula, applied client-side to already-fetched
 * state-average AQI so the map doesn't need a new backend endpoint just to
 * show an approximate state-level score in the hover popup. This is
 * explicitly the *air quality component only*, not the full multi-factor
 * score (which also needs per-district weather/fire data) -- labeled as
 * such everywhere it's shown.
 */
export function airQualityHealthScore(aqi: number | null): number | null {
  if (aqi === null) return null;
  return Math.max(0, Math.min(100, 100 - (aqi / 500) * 100));
}
