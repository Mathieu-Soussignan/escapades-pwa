import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { useApp } from '../../context/AppContext';
import type { Trip, VibeStyle } from '../../types';
import { BudgetTracker } from '../Budget/BudgetTracker';
import { PackingChecklist } from '../Packing/PackingChecklist';
import { parsePriceEstimate, formatPrice } from '../../utils/costUtils';
import { Plus, MapPin, Calendar, Sparkles, Trash2, ChevronRight, ChevronDown, ChevronUp, Wallet } from 'lucide-react';

export const vibeLabels: Record<VibeStyle, { label: string; icon: string }> = {
  balanced: { label: 'Équilibré', icon: '⚖️' },
  relaxed: { label: 'Détente & Zen', icon: '🌿' },
  intense: { label: 'Intense', icon: '⚡' },
  cultural: { label: 'Culture & Patrimoine', icon: '🏛️' },
  gastronomic: { label: 'Gastronomique', icon: '🍷' },
  nature_adventure: { label: 'Nature & Rando', icon: '🏔️' },
  romantic: { label: 'Romantique', icon: '💖' },
};

// Component for Individual Trip Card with Live Estimated Cost Calculation
const TripCardItem: React.FC<{
  trip: Trip;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelectTrip: () => void;
  onDeleteTrip: (e: React.MouseEvent) => void;
}> = ({ trip, isExpanded, onToggleExpand, onSelectTrip, onDeleteTrip }) => {
  const vibeInfo = vibeLabels[trip.vibe] || vibeLabels.balanced;

  // Live Query for all days of this trip
  const days = useLiveQuery(() => (trip.id ? db.days.where('tripId').equals(trip.id).toArray() : []), [trip.id]);
  const dayIds = days?.map(d => d.id!) || [];

  // Live Query for all activities of this trip
  const activities = useLiveQuery(
    () => (dayIds.length > 0 ? db.activities.where('dayId').anyOf(dayIds).toArray() : []),
    [dayIds.join(',')]
  );

  const totalEstimatedCost = activities?.reduce(
    (acc, act) => acc + parsePriceEstimate(act.priceEstimate),
    0
  ) || 0;

  return (
    <div className="space-y-3">
      <div
        onClick={onSelectTrip}
        className="group relative rounded-3xl overflow-hidden glass-panel border border-slate-800/80 hover:border-blue-500/40 p-4 transition-all duration-300 shadow-xl cursor-pointer active:scale-[0.99]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity"
          style={{ backgroundImage: `url(${trip.coverImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="space-y-1.5 max-w-[80%]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-200 bg-slate-900/80 border border-slate-700 px-2.5 py-0.5 rounded-full">
                <MapPin className="w-3 h-3 text-rose-400" />
                {trip.destination}
              </span>
              <span className="text-[10px] text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded-full">
                {vibeInfo.icon} {vibeInfo.label}
              </span>

              {/* Dynamic Estimated Cost Badge */}
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                <Wallet className="w-3 h-3 text-emerald-400" />
                ~{formatPrice(totalEstimatedCost, trip.currency)}
              </span>
            </div>

            <h3 className="font-extrabold text-base text-white tracking-tight font-display">
              {trip.title}
            </h3>

            {trip.notes && (
              <p className="text-xs text-slate-400 line-clamp-1">
                {trip.notes}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900/80"
              title="Ouvrir budget et valise"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <button
              onClick={onDeleteTrip}
              className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg bg-slate-900/80 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            {trip.startDate}
          </span>

          <span className="flex items-center gap-1 text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
            Voir la timeline
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Expanded Budget & Packing Drawer */}
      {isExpanded && (
        <div className="space-y-3 pl-2 border-l-2 border-blue-500/40 animate-fadeIn">
          <BudgetTracker trip={trip} />
          <PackingChecklist trip={trip} />
        </div>
      )}
    </div>
  );
};

export const TripList: React.FC = () => {
  const { setActiveTripId, setActiveTab, showToast } = useApp();
  const trips = useLiveQuery(() => db.trips.toArray(), []);

  const [filter, setFilter] = useState<'all' | 'active' | 'planned' | 'completed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedTripId, setExpandedTripId] = useState<number | null>(null);

  // New Trip Form State
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [vibe, setVibe] = useState<VibeStyle>('balanced');
  const [notes, setNotes] = useState('');

  const filteredTrips = trips?.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !destination) return;

    const newTripId = await db.trips.add({
      title,
      destination,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0],
      coverImage: coverImage || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
      vibe,
      notes,
      budgetGoal: 500,
      currency: 'EUR',
      status: 'planned',
      createdAt: new Date().toISOString()
    });

    await db.days.add({
      tripId: newTripId as number,
      dayNumber: 1,
      date: startDate,
      title: "Jour 1: Découverte & Arrivée",
      summary: "Première journée d'exploration."
    });

    setActiveTripId(newTripId as number);
    setShowCreateModal(false);
    showToast('Nouvelle escapade créée !');
    setActiveTab('timeline');
  };

  const handleDeleteTrip = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Voulez-vous vraiment supprimer cette escapade et son planning ?')) {
      const days = await db.days.where('tripId').equals(id).toArray();
      const dayIds = days.map(d => d.id!);

      await db.activities.where('dayId').anyOf(dayIds).delete();
      await db.days.where('tripId').equals(id).delete();
      await db.expenses.where('tripId').equals(id).delete();
      await db.packingItems.where('tripId').equals(id).delete();
      await db.trips.delete(id);
      showToast('Escapade supprimée');
    }
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-display">Mes Escapades</h2>
          <p className="text-xs text-slate-400">Gérez vos voyages, budget & checklists valise</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ai_planner')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-lg shadow-blue-500/25 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            IA Magic
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'active', label: 'En cours' },
          { id: 'planned', label: 'À venir' },
          { id: 'completed', label: 'Terminées' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === tab.id
                ? 'bg-slate-800 text-blue-400 border border-blue-500/30'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800/80 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trip Cards Grid */}
      <div className="space-y-4">
        {filteredTrips && filteredTrips.length > 0 ? (
          filteredTrips.map((trip) => (
            <TripCardItem
              key={trip.id}
              trip={trip}
              isExpanded={expandedTripId === trip.id}
              onToggleExpand={() => setExpandedTripId(expandedTripId === trip.id ? null : trip.id!)}
              onSelectTrip={() => {
                setActiveTripId(trip.id!);
                setActiveTab('timeline');
              }}
              onDeleteTrip={(e) => handleDeleteTrip(trip.id!, e)}
            />
          ))
        ) : (
          <div className="text-center py-12 glass-panel rounded-3xl border border-slate-800 p-6 space-y-3">
            <MapPin className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">Aucune escapade trouvée.</p>
          </div>
        )}
      </div>

      {/* Manual Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg glass-panel rounded-t-3xl sm:rounded-3xl p-5 border border-slate-700/80 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-slate-100 font-display">Nouvelle Escapade</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTrip} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Titre du voyage *</label>
                <input
                  type="text"
                  placeholder="Ex: Week-end romantique à Rome..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Destination *</label>
                <input
                  type="text"
                  placeholder="Ex: Rome, Italie"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Date de début</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Date de fin</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/25"
                >
                  Créer l'escapade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
