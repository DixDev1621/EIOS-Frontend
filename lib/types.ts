export interface StateMapDatum {
  code: string;
  name: string;
  capital: string;
  lat: number;
  lon: number;
  population: number;
  isUnionTerritory: boolean;
  districtDataAvailable: boolean;
  aqi: number | null;
  category: string | null;
  districtCount: number | null;
}

export interface District {
  code: string;
  name: string;
  headquarters: string;
  lat: number;
  lon: number;
  area_km2: number | null;
  population: number | null;
  state_code?: string;
}

export interface NationalStateSummary {
  code: string;
  name: string;
  capital: string;
  lat: number;
  lon: number;
  area_km2: number;
  population: number;
  is_union_territory: boolean;
  district_data_available: boolean;
}

export interface NationalOverview {
  states_total_in_registry: number;
  states_with_live_data: string[];
  districts_total_live: number;
  districts_reporting: number;
  average_aqi: number | null;
  most_polluted: (DistrictQuickStatus & { state_code: string })[];
  least_polluted: (DistrictQuickStatus & { state_code: string })[];
  all_states: NationalStateSummary[];
}

export interface StateInfo {
  code: string;
  name: string;
  capital: string;
  lat: number;
  lon: number;
  area_km2: number;
  population: number;
  district_count: number;
}

export interface DistrictQuickStatus {
  code: string;
  name: string;
  lat: number;
  lon: number;
  aqi: number | null;
  category: string | null;
  color: string | null;
}

export interface StateOverview {
  state: StateInfo;
  average_aqi: number | null;
  districts_reporting: number;
  districts_total: number;
  most_polluted: DistrictQuickStatus[];
  least_polluted: DistrictQuickStatus[];
  all_districts: DistrictQuickStatus[];
}

export interface AQIBlock {
  value: number | null;
  category: string | null;
  color: string | null;
  dominant_pollutant: string | null;
  sub_indices: Record<string, number>;
  pollutants_raw: Record<string, number | string | null>;
}

export interface WeatherBlock {
  temperature_c: number | null;
  apparent_temperature_c: number | null;
  humidity_pct: number | null;
  wind_speed_kmh: number | null;
  wind_direction_deg: number | null;
  precipitation_mm: number | null;
  daily_forecast: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
  };
}

export interface FireDetection {
  lat: number;
  lon: number;
  brightness_k: number;
  confidence: string;
  acquired_date: string;
  acquired_time: string;
  frp_mw: number | null;
  day_night: string;
}

export interface FiresBlock {
  configured: boolean;
  detections: FireDetection[];
  message?: string;
}

export interface HealthScoreBlock {
  score: number;
  air_quality_component: number;
  weather_stress_component: number;
  fire_load_component: number;
  inputs: Record<string, number | null>;
}

export interface Recommendation {
  audience: string;
  severity: "info" | "advisory" | "warning" | "emergency";
  action: string;
  basis: string;
}

export interface DistrictDashboard {
  district: District;
  aqi: AQIBlock;
  weather: WeatherBlock;
  fires: FiresBlock;
  health_score: HealthScoreBlock;
  recommendations: Recommendation[];
  as_of: string | null;
}

export interface ForecastResult {
  district: string;
  status: "ok" | "insufficient_data";
  prediction_pm25?: number;
  predicted_aqi?: number | null;
  predicted_category?: string | null;
  horizon_hours?: number;
  confidence?: number;
  cross_validated_mae?: number;
  top_factors?: { feature: string; impact: number }[];
  latest_observed_pm25?: number | null;
  rows_available?: number;
}

export interface ExplainResult {
  district: string;
  as_of: string;
  aqi: number;
  category: string;
  dominant_pollutant: string;
  reasons: string[];
  evidence: Record<string, unknown>;
}

export interface Alert {
  type: "air_quality" | "heatwave" | "forest_fire" | "cyclone";
  severity: "warning" | "severe";
  district: string;
  message: string;
  value: number;
}
