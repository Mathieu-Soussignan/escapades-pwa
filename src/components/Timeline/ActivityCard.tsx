import React, { useState } from 'react';
import type { Activity, GPSApp } from '../../types';
import { CategoryBadge } from './CategoryBadge';
import { openGPS } from '../../services/gpsService';
import { estimateTransitInfo } from '../../utils/geoUtils';
import { getGetYourGuideUrl } from '../../services/affiliateService';
import { 
  Check, 
  MapPin, 
  Clock, 
  Navigation, 
  Trash2, 
  Edit3, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Footprints,
  Car,
  Ticket
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActivityCardProps {
  activity: Activity;
  prevActivity?: Activity;
  defaultGPS: GPSApp;
  partnerId?: string;
  destination?: string;
  onToggleComplete: (id: number, currentCompleted: boolean) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (id: number) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  prevActivity,
  defaultGPS,
  partnerId,
  destination,
  onToggleComplete,
  onEdit,
  onDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showGPSMenu, setShowGPSMenu] = useState(false);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activity.id) return;
    
    if (!activity.completed) {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
    onToggleComplete(activity.id, activity.completed);
  };

  const handleLaunchGPS = (app: GPSApp, e: React.MouseEvent) => {
    e.stopPropagation();
    openGPS(app, {
      locationName: activity.locationName,
      address: activity.address,
      latitude: activity.latitude,
      longitude: activity.longitude
    });
    setShowGPSMenu(false);
  };

  const transitInfo = prevActivity ? estimateTransitInfo(
    prevActivity.latitude, prevActivity.longitude,
    activity.latitude, activity.longitude
  ) : null;

  const showTicketButton = ['monument', 'culture', 'activity', 'nature', 'museum'].includes(activity.category);
  const ticketUrl = getGetYourGuideUrl(activity.locationName, destination, partnerId);

  return (
    <div className="space-y-2">
      
      {/* Transit Connector Badge between steps */}
      {transitInfo && (
        <div className="flex items-center justify-center my-1">
          <div className="inline-flex items-center gap-2 text-[10px] font-semibold text-slate-400 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-full shadow-sm">
            <span className="flex items-center gap-1 text-blue-400">
              <Footprints className="w-3 h-3 text-blue-400" />
              {transitInfo.walkTimeMin} min à pied
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <Car className="w-3 h-3 text-emerald-400" />
              {transitInfo.driveTimeMin} min en voiture ({transitInfo.distanceKm} km)
            </span>
          </div>
        </div>
      )}

      <div
        className={`relative group glass-panel rounded-2xl p-4 transition-all duration-300 border ${
          activity.completed
            ? 'bg-slate-900/40 border-slate-800/60 opacity-75'
            : 'bg-slate-900/80 border-slate-700/60 hover:border-slate-600/80 shadow-lg'
        }`}
      >
        {/* Top Header Row: Time & Category */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
              <Clock className="w-3 h-3" />
              {activity.time}
            </span>
            <CategoryBadge category={activity.category} size="sm" />
          </div>

          <div className="flex items-center gap-1">
            {activity.priceEstimate && (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {activity.priceEstimate}
              </span>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Main Content Row */}
        <div className="flex items-start gap-3">
          <button
            onClick={handleCheckboxClick}
            className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              activity.completed
                ? 'bg-emerald-500 border-emerald-500 text-slate-950 scale-105'
                : 'border-slate-600 hover:border-blue-400 bg-slate-950/60'
            }`}
          >
            {activity.completed && <Check className="w-4 h-4 stroke-[3]" />}
          </button>

          <div className="flex-1 min-w-0" onClick={() => setIsExpanded(!isExpanded)}>
            <h3
              className={`font-semibold text-base leading-snug tracking-tight ${
                activity.completed ? 'line-through text-slate-400' : 'text-slate-100'
              }`}
            >
              {activity.title}
            </h3>

            <p className="flex items-center gap-1 text-xs text-slate-400 mt-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">{activity.locationName}</span>
            </p>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 text-xs text-slate-300 space-y-2 animate-fadeIn">
            {activity.description && (
              <p className="leading-relaxed bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/50">
                {activity.description}
              </p>
            )}

            {activity.address && (
              <p className="text-slate-400 text-[11px] flex items-start gap-1">
                <span className="font-semibold text-slate-300">Adresse:</span> {activity.address}
              </p>
            )}

            {activity.durationMinutes && (
              <p className="text-slate-400 text-[11px]">
                ⏱️ <span className="font-semibold text-slate-300">Durée estimée:</span> {activity.durationMinutes} min
              </p>
            )}
          </div>
        )}

        {/* Action Bar: GPS + Affiliate Ticket Button */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGPSMenu(!showGPSMenu);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-300 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                <span>Naviguer</span>
                <ExternalLink className="w-3 h-3 text-blue-400/70" />
              </button>

              {showGPSMenu && (
                <div className="absolute left-0 bottom-full mb-2 w-48 glass-panel rounded-2xl shadow-2xl p-1.5 z-30 border border-slate-700/80 space-y-1 animate-scaleIn">
                  <div className="text-[10px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    Lancer le GPS
                  </div>
                  <button
                    onClick={(e) => handleLaunchGPS('google_maps', e)}
                    className="w-full flex items-center gap-2 text-xs text-slate-200 hover:bg-blue-600/30 p-2 rounded-xl text-left transition-colors font-medium"
                  >
                    🗺️ Google Maps
                  </button>
                  <button
                    onClick={(e) => handleLaunchGPS('waze', e)}
                    className="w-full flex items-center gap-2 text-xs text-slate-200 hover:bg-blue-600/30 p-2 rounded-xl text-left transition-colors font-medium"
                  >
                    🏎️ Waze
                  </button>
                  <button
                    onClick={(e) => handleLaunchGPS('apple_maps', e)}
                    className="w-full flex items-center gap-2 text-xs text-slate-200 hover:bg-blue-600/30 p-2 rounded-xl text-left transition-colors font-medium"
                  >
                    🍏 Apple Maps
                  </button>
                </div>
              )}
            </div>

            {/* AFFILIATE TICKET BUTTON */}
            {showTicketButton && (
              <a
                href={ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-200 bg-emerald-500/20 hover:bg-emerald-500/35 border border-emerald-500/50 ring-1 ring-emerald-400/30 px-3 py-1.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer hover:scale-105"
                title="Réserver les billets et visites guidées"
              >
                <Ticket className="w-3.5 h-3.5 text-emerald-400" />
                <span>🎟️ Billets ↗</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => onEdit(activity)}
              className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800/50 transition-colors"
              title="Modifier"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => activity.id && onDelete(activity.id)}
              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800/50 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
