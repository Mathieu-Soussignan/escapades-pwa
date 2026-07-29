import React from 'react';
import { useApp } from '../context/AppContext';
import { Compass, WifiOff, Sparkles, Plus } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export const Header: React.FC = () => {
  const { activeTripId, setActiveTripId, isOnline, setActiveTab } = useApp();

  const trips = useLiveQuery(() => db.trips.toArray(), []);
  const activeTrip = trips?.find(t => t.id === activeTripId) || trips?.[0];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 py-3 pt-safe transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Compass className="w-5 h-5 text-white animate-pulse-subtle" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight font-display bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Escapades
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              MON CARNET DE VOYAGE
            </p>
          </div>
        </div>

        {/* Offline Badge & Active Trip Picker */}
        <div className="flex items-center gap-2">
          {!isOnline && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full animate-pulse">
              <WifiOff className="w-3 h-3" />
              Hors-ligne
            </span>
          )}

          {trips && trips.length > 0 ? (
            <select
              value={activeTrip?.id || ''}
              onChange={(e) => setActiveTripId(Number(e.target.value))}
              className="bg-slate-900/90 text-xs text-slate-200 font-medium border border-slate-700/60 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-blue-500 max-w-[140px] truncate"
            >
              {trips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => setActiveTab('ai_planner')}
              className="flex items-center gap-1 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 rounded-xl shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Créer
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
