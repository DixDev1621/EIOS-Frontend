# EIOS Frontend -- Next.js dashboard

Real-data dashboard for the India Environmental Intelligence OS (Tamil Nadu build).
Every number on screen comes from the FastAPI backend, which in turn comes from
live public providers -- there is no mock data layer.

## Design system

The visual identity is built around the vocabulary of a real synoptic weather
station plot (a center reading with compass-position readouts) rather than a
generic dark-mode SaaS template, and uses the **official CPCB National AQI
color scale** functionally throughout (see `tailwind.config.ts`).

- Display type: Space Grotesk
- Body type: Inter
- Data/readout type: IBM Plex Mono
- Base palette: deep slate-navy (`base-*`), not pure black
- Interactive accent: instrument-panel cyan (`signal`)
- Data color: CPCB AQI categories (`aqi-good` ... `aqi-severe`)

## Quick start

```bash
npm install
cp .env.local.example .env.local   # point at your running backend
npm run dev
```

Open http://localhost:3000. The backend must be running at the URL configured
in `.env.local` (defaults to `http://localhost:8000/api/v1`) -- see `/backend`.

## Pages

| Route | Purpose |
|---|---|
| `/` | National/state summary, active alerts, most/least polluted districts |
| `/state/TN` | Tamil Nadu map (MapLibre) + all-38-district explorer grid |
| `/district/[code]` | Full district dashboard: AQI, weather, PM2.5 trend, AI forecast + SHAP explainability, recommendations, AI chat panels, fire detections |

## Type checking / linting

```bash
npm run typecheck
npm run lint
```
