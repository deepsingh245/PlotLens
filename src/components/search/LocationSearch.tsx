"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { GeocodeResult } from "@/app/api/geocode/route";

/**
 * Explicit-submit search only (type -> Enter/click -> results list) — NOT
 * live-suggest-as-you-type. Nominatim's usage policy explicitly prohibits
 * client-side autocomplete; see docs/DATA_SOURCES.md's Nominatim entry.
 * This is why a plain results list is used here instead of ReUI's Command
 * component, which is built around live local filtering.
 */
export function LocationSearch({
  onSelect,
  placeholder = "Search for a place…",
}: {
  onSelect: (result: GeocodeResult) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;

    setStatus("loading");
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Search failed");
      const data = (await response.json()) as { results: GeocodeResult[] };
      setResults(data.results);
      setStatus("idle");
    } catch {
      setResults([]);
      setStatus("error");
    }
  }

  function handleSelect(result: GeocodeResult) {
    onSelect(result);
    setResults([]);
    setQuery(result.label);
  }

  return (
    <div className="relative w-full max-w-sm">
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="h-7 text-sm"
        />
        <Button type="submit" size="icon-sm" variant="ghost" aria-label="Search">
          {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
        </Button>
      </form>

      {status === "error" && (
        <p className="text-destructive absolute top-full mt-1 text-xs">Search failed — try again.</p>
      )}

      {results.length > 0 && (
        <ul className="bg-surface-elevated border-border absolute top-full z-10 mt-1 w-full rounded-md border shadow-lg">
          {results.map((result, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => handleSelect(result)}
                className="text-text-primary hover:bg-surface w-full truncate px-3 py-2 text-left text-sm"
              >
                {result.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
