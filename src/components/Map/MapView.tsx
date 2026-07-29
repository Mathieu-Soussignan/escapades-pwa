import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Activity, GPSApp } from '../../types';
import { openGPS } from '../../services/gpsService';
import { categoryConfig } from '../Timeline/CategoryBadge';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon default asset path issue in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  activities: Activity[];
  defaultGPS: GPSApp;
}

// Component to dynamically fit map bounds to markers
const MapBoundsFitter: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [coords, map]);
  return null;
};

export const MapView: React.FC<MapViewProps> = ({ activities, defaultGPS }) => {
  // Filter activities with valid lat/lng coordinates or estimate default coords if missing
  const activitiesWithCoords = activities.map((act, index) => {
    let lat = act.latitude;
    let lng = act.longitude;

    // Fallback coordinates for demo if lat/lng is missing
    if (lat === undefined || lng === undefined) {
      lat = 45.8986 + (index * 0.005);
      lng = 6.1278 + (index * 0.006);
    }
    return { ...act, latitude: lat, longitude: lng };
  });

  const positions: [number, number][] = activitiesWithCoords.map(a => [a.latitude!, a.longitude!]);
  const center: [number, number] = positions.length > 0 ? positions[0] : [45.8986, 6.1278];

  return (
    <div className="relative w-full h-[280px] rounded-3xl overflow-hidden glass-panel border border-slate-800 shadow-2xl z-10">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
        style={{ background: '#090d16' }}
      >
        {/* CartoDB Dark Matter Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapBoundsFitter coords={positions} />

        {/* Route Polyline */}
        {positions.length > 1 && (
          <Polyline
            positions={positions}
            pathOptions={{ color: '#0A84FF', weight: 3, opacity: 0.8, dashArray: '6, 8' }}
          />
        )}

        {/* Category Markers */}
        {activitiesWithCoords.map((act) => {
          const conf = categoryConfig[act.category] || categoryConfig.activity;

          // Custom HTML Pin Icon
          const customPin = L.divIcon({
            className: 'custom-leaflet-pin',
            html: `<div style="
              background: #0f172a;
              border: 2px solid ${act.completed ? '#10b981' : '#3b82f6'};
              color: white;
              border-radius: 9999px;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 11px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            ">${act.time.split(':')[0]}h</div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          return (
            <Marker key={act.id || act.title} position={[act.latitude!, act.longitude!]} icon={customPin}>
              <Popup className="custom-dark-popup">
                <div className="p-1 space-y-1.5 text-slate-900 text-xs font-sans">
                  <div className="font-bold text-slate-950 flex items-center justify-between gap-2">
                    <span>{act.time} — {act.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">📍 {act.locationName}</p>

                  <div className="pt-1 flex items-center justify-between border-t border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-500">{conf.label}</span>
                    <button
                      onClick={() => openGPS(defaultGPS, { locationName: act.locationName, address: act.address, latitude: act.latitude, longitude: act.longitude })}
                      className="px-2 py-1 bg-blue-600 text-white font-bold rounded-lg text-[10px]"
                    >
                      GPS 🏎️
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
