const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, revalidateSeconds = 300): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(body.detail ?? "Request failed", res.status);
  }

  return res.json() as Promise<T>;
}

export const api = {
  getNationalOverview: () =>
    request<import("./types").NationalOverview>("/national/overview", 900),
  getDigitalTwin: (code: string) => request<any>(`/national/twin/${code}`, 900),
  listStates: () => request<{ states: any[] }>("/states"),
  getState: (code: string) => request<any>(`/states/${code}`),
  getStateOverview: (code: string) => request<import("./types").StateOverview>(`/states/${code}/overview`, 900),
  listDistricts: () => request<{ districts: import("./types").District[]; count: number }>("/districts"),
  getDistrict: (code: string) => request<import("./types").District>(`/districts/${code}`),
  getDistrictDashboard: (code: string) =>
    request<import("./types").DistrictDashboard>(`/districts/${code}/dashboard`, 900),
  getDistrictAqiHourly: (code: string) => request<any>(`/districts/${code}/aqi`, 900),
  getDistrictForecast: (code: string) =>
    request<import("./types").ForecastResult>(`/districts/${code}/forecast`, 900),
  explainPollution: (district: string) =>
    request<import("./types").ExplainResult>(`/ai/explain?district=${encodeURIComponent(district)}`, 900),
  simulateTraffic: (district: string, reductionPct: number) =>
    request<any>(`/ai/simulate-traffic?district=${encodeURIComponent(district)}&reduction_pct=${reductionPct}`, 0),
  vulnerableDistricts: (topN = 5) =>
    request<any>(`/ai/vulnerable-districts?top_n=${topN}`, 900),
  getAlerts: () => request<{ count: number; alerts: import("./types").Alert[] }>("/alerts", 300),
  search: (q: string) => request<any>(`/search?q=${encodeURIComponent(q)}`, 0),
};
