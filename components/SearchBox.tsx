"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface SearchResult {
  type: "state" | "district";
  name: string;
  code: string;
  headquarters?: string;
}

export function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function handleChange(value: string) {
    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    try {
      const base =
        process.env.NEXT_PUBLIC_API_BASE_URL ??
        "https://eios-backend.onrender.com/api/v1";

      const res = await fetch(
        `${base}/search?q=${encodeURIComponent(value)}`
      );

      if (!res.ok) {
        throw new Error("Search failed");
      }

      const data = await res.json();
      setResults(data.results ?? []);
      setOpen(true);
    } catch {
      setResults([]);
      setOpen(false);
    }
  }

  function handleSelect(result: SearchResult) {
    setOpen(false);
    setQuery("");

    startTransition(() => {
      if (result.type === "district") {
        router.push(`/district/${result.code}`);
      } else {
        router.push(`/state/${result.code}`);
      }
    });
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search a district, e.g. Coimbatore"
        className="w-full rounded-md border border-base-600 bg-base-800 px-3 py-1.5 text-sm text-ink-100 placeholder:text-ink-700 focus:border-signal focus:outline-none"
        aria-label="Search districts and states"
      />

      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-base-600 bg-base-800 shadow-panel">
          {results.map((r) => (
            <li key={`${r.type}-${r.code}`}>
              <button
                type="button"
                onClick={() => handleSelect(r)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink-300 hover:bg-base-700 hover:text-ink-100"
              >
                <span>{r.name}</span>
                <span className="font-mono text-xs text-ink-500">
                  {r.type === "district" ? r.headquarters : "State"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}