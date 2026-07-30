import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Activity, GPSApp } from '../../types';
import { openGPS } from '../../services/gpsService';
import { categoryConfigs } from '../Timeline/CategoryBadge';
import { getDestinationCoordinates } from '../../utils/geoUtils';

interface MapViewProps {
  activities: Activity[];
  defaultGPS: GPSApp;
  destination?: string;
}

// Fix Leaflet default icon path issue in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const MapView: React.FC<MapViewProps> = ({ activities, defaultGPS, destination = 'Annecy' }) => {
  const mapContainerId = "escapades-interactive-map";
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let isMounted = true;
    getDestinationCoordinates(destination).then((coords) => {
      if (isMounted) {
        setMapCenter(coords);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [destination]);

  useEffect(() => {
    if (!activities || activities.length === 0 || !mapCenter) return;

    const baseLat = mapCenter.lat;
    const baseLng = mapCenter.lng;

    // Filter activities with valid real coordinates or generate deterministic offset around destination center
    const validActivities = activities.map((act, index) => {
      if (act.latitude && act.longitude) {
        return act;
      }
      const offsetLat = (index - activities.length / 2) * 0.008;
      const offsetLng = (index % 2 === 0 ? 1 : -1) * 0.006 * index;
      return {
        ...act,
        latitude: baseLat + offsetLat,
        longitude: baseLng + offsetLng
      };
    });

    const centerLat = validActivities[0]?.latitude || baseLat;
    const centerLng = validActivities[0]?.longitude || baseLng;

    // Initialize Leaflet map
    const map = L.map(mapContainerId, {
      center: [centerLat, centerLng],
      zoom: 13,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark Mode Tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    const latLngs: L.LatLngExpression[] = [];

    // Add Markers and Popups
    validActivities.forEach((act, idx) => {
      if (!act.latitude || !act.longitude) return;

      const pos: L.LatLngExpression = [act.latitude, act.longitude];
      latLngs.push(pos);

      const customHtmlIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background: #0f172a;
            border: 2px solid ${act.completed ? '#10b981' : '#3b82f6'};
            border-radius: 9999px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          ">
            ${idx + 1}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const popupContent = document.createElement('div');
      popupContent.className = "p-1 text-slate-900 font-sans space-y-1.5";
      popupContent.innerHTML = `
        <div style="font-weight: bold; font-size: 13px; color: #0f172a;">${act.time} — ${act.title}</div>
        <div style="font-size: 11px; color: #475569;">📍 ${act.locationName}</div>
        ${act.priceEstimate ? `<div style="font-size: 11px; color: #059669; font-weight: 600;">💰 ${act.priceEstimate}</div>` : ''}
      `;

      const btn = document.createElement('button');
      btn.className = "mt-2 w-full py-1.5 px-3 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow";
      btn.innerHTML = `<span>Naviguer GPS</span>`;
      btn.onclick = () => {
        openGPS(defaultGPS, {
          locationName: act.locationName,
          address: act.address,
          latitude: act.latitude,
          longitude: act.longitude
        });
      };
      popupContent.appendChild(btn);

      L.marker(pos, { icon: customHtmlIcon })
        .addTo(map)
        .bindPopup(popupContent);
    });

    // Draw route polyline
    if (latLngs.length > 1) {
      const polyline = L.polyline(latLngs, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.8,
        dashArray: '8, 8'
      }).addTo(map);

      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }

    return () => {
      map.remove();
    };
  }, [activities, defaultGPS, mapCenter]);

  return (
    <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800 shadow-xl h-[420px] w-full">
      <div id={mapContainerId} className="h-full w-full z-10" />
    </div>
  );
};
