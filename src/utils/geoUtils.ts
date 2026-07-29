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
