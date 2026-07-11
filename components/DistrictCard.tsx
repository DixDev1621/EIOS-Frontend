import Link from "next/link";
import { AqiBadge } from "./AqiBadge";
import type { DistrictQuickStatus } from "@/lib/types";

export function DistrictCard({ district }: { district: DistrictQuickStatus }) {
  return (
    <Link
      href={`/district/${district.code}`}
      className="group flex flex-col justify-between gap-3 rounded-lg border border-base-600 bg-base-800 p-4 transition-colors hover:border-signal-dim"
    >
      <div className="flex items-start justify-between">
        <span className="font-display text-base font-semibold text-ink-100 group-hover:text-signal transition-colors">
          {district.name}
        </span>
        <span className="font-mono text-xs text-ink-700">{district.code}</span>
      </div>
      <AqiBadge value={district.aqi} category={district.category} size="sm" />
    </Link>
  );
}
