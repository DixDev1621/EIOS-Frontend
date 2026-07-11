import clsx from "clsx";

const CATEGORY_COLOR: Record<string, string> = {
  Good: "bg-aqi-good",
  Satisfactory: "bg-aqi-satisfactory",
  Moderate: "bg-aqi-moderate",
  Poor: "bg-aqi-poor",
  "Very Poor": "bg-aqi-verypoor",
  Severe: "bg-aqi-severe",
};

export function AqiBadge({
  value,
  category,
  size = "md",
}: {
  value: number | null;
  category: string | null;
  size?: "sm" | "md" | "lg";
}) {
  if (value === null || category === null) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-base-500 px-3 py-1 text-xs text-ink-500">
        No data
      </span>
    );
  }

  const dot = CATEGORY_COLOR[category] ?? "bg-ink-500";
  const sizeClass =
    size === "lg" ? "text-2xl px-4 py-1.5" : size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border border-base-500 font-mono",
        sizeClass
      )}
    >
      <span className={clsx("h-2 w-2 rounded-full", dot)} aria-hidden />
      <span className="font-semibold text-ink-100">{Math.round(value)}</span>
      <span className="text-ink-500">{category}</span>
    </span>
  );
}
