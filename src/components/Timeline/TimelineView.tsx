import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initSeedData } from '../../db/database';
import { useApp } from '../../context/AppContext';
import { ActivityCard } from './ActivityCard';
import { ActivityModal } from './ActivityModal';
import { MapView } from '../Map/MapView';
import { fetchWeatherForDestination } from '../../services/weatherService';
import { reOptimizeDayWithLLM } from '../../services/llmService';
import type { Activity, WeatherData } from '../../types';
import { Plus, Calendar, Sparkles, MapPin, Clock, Map, List, CloudRain, Sun, Share2, Loader2, Zap, Utensils } from 'lucide-react';

export const TimelineView: React.FC = () => {
  const { activeTripId, setActiveTripId, setActiveTab, showToast } = useApp();

  const trips = useLiveQuery(() => db.trips.toArray(), []);
  const settings = useLiveQuery(() => db.settings.toCollection().first(), []);

  const activeTrip = trips?.find(t => t.id === activeTripId) || trips?.[0];

  const days = useLiveQuery(
    () => (activeTrip?.id ? db.days.where('tripId').equals(activeTrip.id).toArray() : []),
    [activeTrip?.id]
  );

  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isReoptimizing, setIsReoptimizing] = useState(false);

  useEffect(() => {
    if (days && days.length > 0) {
      if (!selectedDayId || !days.some(d => d.id === selectedDayId)) {
        setSelectedDayId(days[0].id!);
      }
    } else {
      setSelectedDayId(null);
    }
  }, [days, activeTrip?.id]);

  useEffect(() => {
    if (activeTrip && activeTrip.id && activeTripId !== activeTrip.id) {
      setActiveTripId(activeTrip.id);
    }
  }, [activeTrip, activeTripId]);

  // Fetch Weather
  useEffect(() => {
    if (activeTrip?.destination) {
      fetchWeatherForDestination(activeTrip.destination).then(res => setWeather(res));
    }
  }, [activeTrip?.destination]);

  const selectedDay = days?.find(d => d.id === selectedDayId);

  const activities = useLiveQuery(
    () => (selectedDayId ? db.activities.where('dayId').equals(selectedDayId).sortBy('time') : []),
    [selectedDayId]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const handleToggleComplete = async (id: number, currentCompleted: boolean) => {
    await db.activities.update(id, { completed: !currentCompleted });
  };

  const handleDeleteActivity = async (id: number) => {
    await db.activities.delete(id);
    showToast('Activité supprimée');
  };

  const handleSaveActivity = async (data: Partial<Activity>) => {
    if (data.id) {
      await db.activities.update(data.id, data);
      showToast('Étape mise à jour');
    } else {
      await db.activities.add(data as Activity);
      showToast('Nouvelle étape ajoutée à votre journée !');
    }
  };

  // AI Magic Re-Plan (Il pleut ! / Trop chargé)
  const handleRePlanDay = async (mode: 'rain' | 'lighter' | 'epicurean') => {
    if (!selectedDay || !activities || !activeTrip) return;
    setIsReoptimizing(true);
    showToast('Ré-optimisation par Mistral en cours... ✨');

    try {
      const currentSettings = settings || {
        llmProvider: 'mistral',
        apiKey: '',
        modelName: 'mistral-small-latest',
        defaultGPS: 'google_maps',
        theme: 'dark'
      };

      const newPlan = await reOptimizeDayWithLLM(
        activeTrip.destination,
        selectedDay.title,
        activities,
        mode,
        currentSettings
      );

      // Update Day
      await db.days.update(selectedDay.id!, {
        title: newPlan.title,
        summary: newPlan.summary
      });

      // Clear existing activities & insert new ones
      await db.activities.where('dayId').equals(selectedDay.id!).delete();
      const newActsToInsert = newPlan.activities.map((a, idx) => ({
        dayId: selectedDay.id!,
        time: a.time,
        title: a.title,
        description: a.description,
        category: a.category,
        locationName: a.locationName,
        durationMinutes: a.durationMinutes || 60,
        priceEstimate: a.priceEstimate,
        completed: false,
        order: idx + 1
      }));
      await db.activities.bulkAdd(newActsToInsert);

      showToast('Journée ré-optimisée avec succès ! ✨');
    } catch (err: any) {
      console.error(err);
      showToast(`Erreur : ${err.message || 'Impossible de ré-optimiser.'}`);
    } finally {
      setIsReoptimizing(false);
    }
  };

  // Share Itinerary for WhatsApp / iMessage
  const handleShareItinerary = () => {
    if (!selectedDay || !activities) return;

    let text = `🗓️ *${activeTrip?.destination} — ${selectedDay.title}*\n`;
    text += `📝 ${selectedDay.summary}\n\n`;

    activities.forEach(a => {
      text += `⏱️ *${a.time}* : ${a.title}\n📍 ${a.locationName}\n\n`;
    });

    navigator.clipboard.writeText(text);
    showToast('Planning copié dans le presse-papier ! (Prêt à coller sur WhatsApp)');
  };

  const completedCount = activities?.filter(a => a.completed).length || 0;
  const totalCount = activities?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const defaultGPS = settings?.defaultGPS || 'google_maps';

  if (!activeTrip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 font-display">Aucune escapade sélectionnée</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-xs">
          Créez votre première escapade personnalisée ou lancez la génération par AI !
        </p>

        <div className="flex flex-col gap-3 mt-6 w-full max-w-xs">
          <button
            onClick={() => setActiveTab('ai_planner')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-blue-500/25"
          >
            <Sparkles className="w-4 h-4" />
            Générer avec l'AI
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      
      {/* Active Trip Header Card */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-5 border border-slate-800 shadow-xl">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
          style={{ backgroundImage: `url(${activeTrip.coverImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <MapPin className="w-3 h-3 text-rose-400" />
                {activeTrip.destination}
              </span>
              
              {/* Weather Widget */}
              {weather && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-200 bg-slate-900/80 border border-slate-700 px-2 py-0.5 rounded-full">
                  <span>{weather.icon}</span>
                  <span>{weather.temperature}°C</span>
                </span>
              )}
            </div>

            <h2 className="text-xl font-extrabold text-white tracking-tight font-display">
              {activeTrip.title}
            </h2>
          </div>

          {/* List / Map Switcher */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 p-0.5 rounded-2xl">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl text-xs transition-all ${
                viewMode === 'list' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-xl text-xs transition-all ${
                viewMode === 'map' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              <Map className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days Selector Pills */}
        {days && days.length > 0 && (
          <div className="relative z-10 flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar pt-1">
            {days.map((day) => {
              const isSelected = day.id === selectedDayId;
              return (
                <button
                  key={day.id}
                  onClick={() => setSelectedDayId(day.id!)}
                  className={`flex-none px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-105'
                      : 'bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Jour {day.dayNumber}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Day Header & Re-Plan Bar */}
      {selectedDay && (
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 font-display">
              {selectedDay.title}
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShareItinerary}
                className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-900"
                title="Partager sur WhatsApp"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {progressPercent}% Fait
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {selectedDay.summary}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* AI Magic Re-Plan Quick Actions Bar */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" /> IA Magic Re-Plan :
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                disabled={isReoptimizing}
                onClick={() => handleRePlanDay('rain')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-semibold hover:bg-blue-500/20 transition-all shrink-0"
              >
                {isReoptimizing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CloudRain className="w-3.5 h-3.5 text-blue-400" />}
                Il pleut ! 🌧️
              </button>
              <button
                disabled={isReoptimizing}
                onClick={() => handleRePlanDay('lighter')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold hover:bg-amber-500/20 transition-all shrink-0"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Trop chargé ⚡️
              </button>
              <button
                disabled={isReoptimizing}
                onClick={() => handleRePlanDay('epicurean')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-semibold hover:bg-purple-500/20 transition-all shrink-0"
              >
                <Utensils className="w-3.5 h-3.5 text-purple-400" />
                Mode Épicurien 🍷
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main View: List or Interactive Map */}
      {viewMode === 'map' ? (
        <MapView activities={activities || []} defaultGPS={defaultGPS} />
      ) : (
        <div className="space-y-3 pt-1">
          {activities && activities.length > 0 ? (
            activities.map((act) => (
              <ActivityCard
                key={act.id}
                activity={act}
                defaultGPS={defaultGPS}
                onToggleComplete={handleToggleComplete}
                onEdit={(actToEdit) => {
                  setEditingActivity(actToEdit);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteActivity}
              />
            ))
          ) : (
            <div className="text-center py-10 glass-panel rounded-2xl border border-slate-800/80 p-6 space-y-3">
              <Clock className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                Aucune activité planifiée pour cette journée.
              </p>
              {selectedDayId && (
                <button
                  onClick={() => {
                    setEditingActivity(null);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600/20 text-blue-400 font-semibold text-xs border border-blue-500/30 hover:bg-blue-600/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter la première étape
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Activity Add/Edit Modal */}
      {selectedDayId && (
        <ActivityModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingActivity(null);
          }}
          onSave={handleSaveActivity}
          dayId={selectedDayId}
          initialActivity={editingActivity}
        />
      )}
    </div>
  );
};
