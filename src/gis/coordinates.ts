/**
 * Coordinate order for this app is always [longitude, latitude] — the GeoJSON
 * spec order, and the opposite of how coordinates are usually spoken aloud.
 * See docs/GIS_ARCHITECTURE.md. Every {lat, lng} <-> [lng, lat] conversion
 * must go through these named helpers — never swap coordinates inline.
 */
export type GeoJsonPosition = [longitude: number, latitude: number];

export interface LngLat {
  lng: number;
  lat: number;
}

export function toGeoJsonPosition(point: LngLat): GeoJsonPosition {
  return [point.lng, point.lat];
}

export function fromGeoJsonPosition(position: GeoJsonPosition): LngLat {
  const [lng, lat] = position;
  return { lng, lat };
}
