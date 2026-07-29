import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initSeedData } from '../../db/database';
import { useApp } from '../../context/AppContext';
import { ActivityCard } from './ActivityCard';
import { ActivityModal } from './ActivityModal';
import type { Activity } from '../../types';
import { Plus, Calendar, Sparkles, MapPin, Clock } from 'lucide-react';

export const TimelineView: React.FC = () => {
  const { activeTripId, setActiveTripId, setActiveTab, showToast } = useApp();

  const trips = useLiveQuery(() => db.trips.toArray(), []);
  const settings = useLiveQuery(() => db.settings.toCollection().first(), []);

  // Determine active trip
  const activeTrip = trips?.find(t => t.id === activeTripId) || trips?.[0];

  // Fetch days for active trip
  const days = useLiveQuery(
    () => (activeTrip?.id ? db.days.where('tripId').equals(activeTrip.id).toArray() : []),
    [activeTrip?.id]
  );

  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);

  // Set default selected day when days load
  useEffect(() => {
    if (days && days.length > 0) {
      if (!selectedDayId || !days.some(d => d.id === selectedDayId)) {
        setSelectedDayId(days[0].id!);
      }
    } else {
      setSelectedDayId(null);
    }
  }, [days, activeTrip?.id]);

  // Sync activeTripId if missing
  useEffect(() => {
    if (activeTrip && activeTrip.id && activeTripId !== activeTrip.id) {
      setActiveTripId(activeTrip.id);
    }
  }, [activeTrip, activeTripId]);

  const selectedDay = days?.find(d => d.id === selectedDayId);

  // Fetch activities for selected day
  const activities = useLiveQuery(
    () => (selectedDayId ? db.activities.where('dayId').equals(selectedDayId).sortBy('time') : []),
    [selectedDayId]
  );

  // Modal State
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

  // Calculate Progress
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

          <button
            onClick={async () => {
              await initSeedData();
              showToast('Exemples d’escapades chargés !');
            }}
            className="w-full py-2.5 rounded-2xl border border-slate-700 text-xs text-slate-300 font-medium hover:bg-slate-900"
          >
            Charger les exemples de démo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12">
      
      {/* Active Trip Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-5 border border-slate-800 shadow-xl">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
          style={{ backgroundImage: `url(${activeTrip.coverImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
              <MapPin className="w-3 h-3 text-rose-400" />
              {activeTrip.destination}
            </span>
            <h2 className="text-xl font-extrabold text-white tracking-tight font-display">
              {activeTrip.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
              {activeTrip.notes || 'Planning personnalisé'}
            </p>
          </div>

          {/* Quick Add Button */}
          {selectedDayId && (
            <button
              onClick={() => {
                setEditingActivity(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Étape</span>
            </button>
          )}
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

      {/* Selected Day Info & Progress Bar */}
      {selectedDay && (
        <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-200 font-display">
              {selectedDay.title}
            </h3>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              {progressPercent}% Fait
            </span>
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
        </div>
      )}

      {/* Activities Timeline */}
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
