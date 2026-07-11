/**
 * The partial real boundary dataset (public/data/india_states_partial.geojson,
 * sourced from amCharts5 geodata, freeware license) uses its own state ID
 * scheme that differs slightly from our internal registry codes in two
 * places. This maps geojson feature id -> our internal state code.
 */
export const GEOJSON_ID_TO_STATE_CODE: Record<string, string> = {
  "IN-AN": "AN",
  "IN-AP": "AP",
  "IN-AR": "AR",
  "IN-AS": "AS",
  "IN-BR": "BR",
  "IN-CH": "CH",
  "IN-CT": "CT",
  "IN-DL": "DL",
  "IN-DH": "DN", // dataset calls it "DH", our registry (and the real UT) is "DN"
  "IN-GA": "GA",
  "IN-GJ": "GJ",
  "IN-HP": "HP",
  "IN-HR": "HR",
  "IN-JH": "JH",
  "IN-LK": "LA", // dataset mislabels Ladakh's id as "LK"; real/registry code is "LA"
  "IN-KA": "KA",
  "IN-KL": "KL",
  "IN-LD": "LD",
  "IN-MH": "MH",
  "IN-ML": "ML",
  "IN-MN": "MN",
};

/** State codes that have real polygon boundary data available. */
export const STATES_WITH_POLYGON_DATA = new Set(Object.values(GEOJSON_ID_TO_STATE_CODE));
