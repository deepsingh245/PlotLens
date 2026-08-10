import { NextRequest, NextResponse } from "next/server";
import { fromGeoJsonPosition, type LngLat } from "@/gis/coordinates";

// TODO: move into providers/osm/ once that module exists (docs/ARCHITECTURE.md providers/).
// Server-side proxy for Nominatim — see docs/DATA_SOURCES.md's Nominatim entry.
// Required because:
//  - browsers cannot set a custom User-Agent, which Nominatim's usage policy requires
//  - the domain must stay allowlisted server-side (docs/SECURITY.md §SSRF)
//  - the 1 req/sec throttle needs one shared point of enforcement

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const MIN_INTERVAL_MS = 1100; // stay safely under Nominatim's 1 req/sec cap

let lastRequestAt = 0;

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

export interface GeocodeResult {
  label: string;
  lngLat: LngLat;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const now = Date.now();
  const elapsed = now - lastRequestAt;
  if (elapsed < MIN_INTERVAL_MS) {
    return NextResponse.json(
      { error: "Too many requests — please wait a moment before searching again." },
      { status: 429 },
    );
  }
  lastRequestAt = now;

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");

  const response = await fetch(url, {
    headers: {
      // Nominatim's usage policy requires a valid identifying User-Agent.
      "User-Agent": "PlotLens/0.1 (personal GIS investigation tool; dev)",
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Search provider unavailable" }, { status: 502 });
  }

  const results = (await response.json()) as NominatimResult[];

  const normalized: GeocodeResult[] = results.map((result) => ({
    label: result.display_name,
    lngLat: fromGeoJsonPosition([Number.parseFloat(result.lon), Number.parseFloat(result.lat)]),
  }));

  return NextResponse.json({ results: normalized });
}
