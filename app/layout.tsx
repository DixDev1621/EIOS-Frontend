import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "EIOS -- India Environmental Intelligence OS",
  description:
    "Real-time air quality, weather and fire intelligence for Tamil Nadu, built on live public data.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-base-950 bg-grid-fade font-body text-ink-100">
        <NavBar />
        <main>{children}</main>
        <footer className="border-t border-base-700 py-8">
          <div className="mx-auto max-w-7xl px-6 text-xs text-ink-700">
            <p>
              Data sources: Open-Meteo (air quality &amp; weather), NASA FIRMS (active fire
              detections), Census of India / Government of Tamil Nadu (district reference data).
              AQI computed using the CPCB National Air Quality Index methodology.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
