/**
  Haversine Formula to calculate distance between two geographical coordinates in km
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export function estimateTransitInfo(
  lat1?: number,
  lon1?: number,
  lat2?: number,
  lon2?: number
): { distanceKm: number; walkTimeMin: number; driveTimeMin: number } | null {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return null;
  }

  const dist = calculateHaversineDistance(lat1, lon1, lat2, lon2);
  if (dist === 0 || dist > 500) return null;

  // Average walking speed: 4.5 km/h -> 13.3 min per km
  const walkTime = Math.round(dist * 13.3);
  // Average city driving speed: 30 km/h -> 2 min per km
  const driveTime = Math.max(3, Math.round(dist * 2));

  return {
    distanceKm: parseFloat(dist.toFixed(1)),
    walkTimeMin: walkTime < 1 ? 2 : walkTime,
    driveTimeMin: driveTime
  };
}

// Known coordinates dictionary for instant 0ms offline fallback
const CITY_COORDS_DICT: Record<string, { lat: number; lng: number }> = {
  'annecy': { lat: 45.8992, lng: 6.1293 },
  'étang de berre': { lat: 43.4883, lng: 5.1561 },
  'berre': { lat: 43.4883, lng: 5.1561 },
  'quinson': { lat: 43.7003, lng: 6.0403 },
  'verdon': { lat: 43.7431, lng: 6.2570 },
  'gorges du verdon': { lat: 43.7431, lng: 6.2570 },
  'cassis': { lat: 43.2144, lng: 5.5392 },
  'marseille': { lat: 43.2965, lng: 5.3698 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'lyon': { lat: 45.7640, lng: 4.8357 },
  'nice': { lat: 43.7102, lng: 7.2620 },
  'bordeaux': { lat: 44.8378, lng: -0.5792 },
  'toulouse': { lat: 43.6047, lng: 1.4442 },
  'strasbourg': { lat: 48.5734, lng: 7.7521 },
  'chamonix': { lat: 45.9237, lng: 6.8694 },
  'rome': { lat: 41.9028, lng: 12.4964 },
  'florence': { lat: 43.7696, lng: 11.2558 },
  'venise': { lat: 45.4408, lng: 12.3155 },
  'barcelone': { lat: 41.3851, lng: 2.1734 },
  'tokyo': { lat: 35.6762, lng: 139.6503 }
};

/**
  Fetch coordinates for any city or destination worldwide with OpenStreetMap Nominatim
 */
export async function getDestinationCoordinates(destination: string): Promise<{ lat: number; lng: number }> {
  const cleanKey = destination.toLowerCase().trim();

  // 1. Check in-memory dictionary
  for (const [key, coords] of Object.entries(CITY_COORDS_DICT)) {
    if (cleanKey.includes(key) || key.includes(cleanKey)) {
      return coords;
    }
  }

  // 2. Check localStorage cache
  const cacheKey = `geo_coords_${cleanKey}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {}
  }

  // 3. Query OpenStreetMap Nominatim API
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`);
    if (res.ok) {
      const data = await res.json();
      if (data && data[0]) {
        const coords = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
        localStorage.setItem(cacheKey, JSON.stringify(coords));
        return coords;
      }
    }
  } catch (err) {
    console.warn('Geocoding API failed, fallback to default:', err);
  }

  // Fallback to Étang de Berre / Provence if not found
  return { lat: 43.4883, lng: 5.1561 };
}
