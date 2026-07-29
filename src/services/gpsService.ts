import { GPSApp } from '../types';

export interface GPSLocationInfo {
  latitude?: number;
  longitude?: number;
  locationName: string;
  address?: string;
}

export function buildGPSUrl(app: GPSApp, location: GPSLocationInfo): string {
  const queryAddress = encodeURIComponent(location.address || location.locationName);
  const hasCoords = location.latitude !== undefined && location.longitude !== undefined;

  switch (app) {
    case 'waze':
      if (hasCoords) {
        return `waze://?ll=${location.latitude},${location.longitude}&navigate=yes`;
      }
      return `https://waze.com/ul?q=${queryAddress}&navigate=yes`;

    case 'apple_maps':
      if (hasCoords) {
        return `https://maps.apple.com/?daddr=${location.latitude},${location.longitude}&dirflg=d`;
      }
      return `https://maps.apple.com/?daddr=${queryAddress}`;

    case 'google_maps':
    default:
      if (hasCoords) {
        return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`;
      }
      return `https://www.google.com/maps/dir/?api=1&destination=${queryAddress}`;
  }
}

export function openGPS(app: GPSApp, location: GPSLocationInfo) {
  const url = buildGPSUrl(app, location);
  window.open(url, '_blank', 'noopener,noreferrer');
}
