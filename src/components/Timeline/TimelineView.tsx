import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { useApp } from '../../context/AppContext';
import { ActivityCard } from './ActivityCard';
import { ActivityModal } from './ActivityModal';
import { MapView } from '../Map/MapView';
import { QRCodeShareModal } from '../Trips/QRCodeShareModal';
import { LandingHero } from '../Landing/LandingHero';
import { SurprisePlannerModal } from '../LLMPlanner/SurprisePlannerModal';
import { fetchWeatherForDestination } from '../../services/weatherService';
import { reOptimizeDayWithLLM, customPromptEditDayWithLLM } from '../../services/llmService';
import { parsePriceEstimate, formatPrice } from '../../utils/costUtils';
import { getBookingUrl, getTrainlineUrl, getFlightUrl, getCarRentalUrl, getGetYourGuideHubUrl, resolveSmartTourismDestination } from '../../services/affiliateService';
import type { Activity, WeatherData } from '../../types';
import { 
  Plus, 
  Calendar, 
  Sparkles, 
  MapPin, 
  Clock, 
  Map, 
  List, 
  CloudRain, 
  Share2, 
  Loader2, 
  Zap, 
  Utensils, 
  Send, 
  MessageSquare, 
  Wallet,
  Building,
  ExternalLink,
  QrCode,
  Car,
  Ticket,
  Plane
} from 'lucide-react';

export const TimelineView: React.FC = () => {
  const { activeTripId, setActiveTripId, setActiveTab, showToast } = useApp();

  const trips = useLiveQuery(() => db.trips.toArray(), []);
  const settings = useLiveQuery(() => db.settings.toCollection().first(), []);

  const activeTrip = trips?.find(t => t.id === activeTripId) || trips?.[0];

  const days = useLiveQuery(
    () => (activeTrip?.id ? db.days.where('tripId').equals(activeTrip.id).toArray() : []),
    [activeTrip?.id]
  );

  const dayIds = days?.map(d => d.id!) || [];

  const allTripActivities = useLiveQuery(
    () => (dayIds.length > 0 ? db.activities.where('dayId').anyOf(dayIds).toArray() : []),
    [dayIds.join(',')]
  );

  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isReoptimizing, setIsReoptimizing] = useState(false);

  const [customAIPrompt, setCustomAIPrompt] = useState('');
  const [showAIPromptBar, setShowAIPromptBar] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSurpriseModal, setShowSurpriseModal] = useState(false);

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

  // Helper to resolve clean, realistic logistics for any trip
  const getCleanLogistics = (trip?: typeof activeTrip) => {
    if (!trip) return { nearestAirport: '', airportIata: '', nearestTrainStation: '', recommendedTransport: '' };

    const destLower = (trip.destination || '').toLowerCase();
    
    let nearestAirport = trip.nearestAirport;
    let airportIata = trip.airportIata;
    let nearestTrainStation = trip.nearestTrainStation;
    let recommendedTransport = trip.recommendedTransport;

    const isFakeStation = !nearestTrainStation || nearestTrainStation.includes(',') || nearestTrainStation.toLowerCase().includes('gorges du verdon') || nearestTrainStation.toLowerCase().includes('pépite');
    const isFakeAirport = !nearestAirport || nearestAirport.includes(',') || nearestAirport.toLowerCase().includes('gorges du verdon') || nearestAirport.toLowerCase().includes('pépite');

    if (destLower.includes('verdon') || destLower.includes('quinson') || destLower.includes('moustiers') || destLower.includes('bauduen') || destLower.includes('sainte-croix') || destLower.includes('cassis') || destLower.includes('marseille') || destLower.includes('velaux')) {
      if (isFakeAirport) {
        nearestAirport = 'Marseille Provence (MRS)';
        airportIata = 'MRS';
      }
      if (isFakeStation) {
        nearestTrainStation = destLower.includes('cassis') ? 'Gare de Cassis' : 'Gare d\'Aix-en-Provence TGV';
      }
      if (!recommendedTransport) {
        recommendedTransport = 'TGV + Location de voiture';
      }
    } else if (destLower.includes('annecy')) {
      if (isFakeAirport) {
        nearestAirport = 'Genève (GVA)';
        airportIata = 'GVA';
      }
      if (isFakeStation) {
        nearestTrainStation = 'Gare d\'Annecy';
      }
      if (!recommendedTransport) {
        recommendedTransport = 'Train TGV direct ou Voiture';
      }
    } else if (destLower.includes('rome')) {
      if (isFakeAirport) {
        nearestAirport = 'Rome Fiumicino (FCO)';
        airportIata = 'FCO';
      }
      if (isFakeStation) {
        nearestTrainStation = 'Roma Termini';
      }
      if (!recommendedTransport) {
        recommendedTransport = 'Vol direct + Métro/Bus';
      }
    } else if (destLower.includes('paris')) {
      if (isFakeAirport) {
        nearestAirport = 'Paris Charles de Gaulle (CDG)';
        airportIata = 'CDG';
      }
      if (isFakeStation) {
        nearestTrainStation = 'Gare de Lyon / Gare du Nord';
      }
      if (!recommendedTransport) {
        recommendedTransport = 'TGV ou Vol + Métro RER';
      }
    } else {
      const cleanCity = resolveSmartTourismDestination(trip.destination);
      if (isFakeStation) nearestTrainStation = `Gare de ${cleanCity}`;
      if (isFakeAirport) nearestAirport = `Aéroport proche de ${cleanCity}`;
    }

    return {
      nearestAirport,
      airportIata,
      nearestTrainStation,
      recommendedTransport
    };
  };

  const logistics = getCleanLogistics(activeTrip);

  useEffect(() => {
    if (activeTrip) {
      fetchWeatherForDestination(activeTrip.destination).then(setWeather);
    }
  }, [activeTrip?.destination]);

  const selectedDay = days?.find(d => d.id === selectedDayId);

  const activities = useLiveQuery(
    () => (selectedDayId ? db.activities.where('dayId').equals(selectedDayId).sortBy('time') : []),
    [selectedDayId]
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const tripTotalEstimatedCost = allTripActivities?.reduce(
    (acc, act) => acc + parsePriceEstimate(act.priceEstimate),
    0
  ) || 0;

  const dayTotalEstimatedCost = activities?.reduce(
    (acc, act) => acc + parsePriceEstimate(act.priceEstimate),
    0
  ) || 0;

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

  const handleCustomAIPromptSubmit = async (e?: React.FormEvent, presetInstruction?: string) => {
    if (e) e.preventDefault();
    const instruction = presetInstruction || customAIPrompt;
    if (!instruction.trim() || !selectedDay || !activities || !activeTrip) return;

    setIsReoptimizing(true);
    showToast('Ajustement du déroulé par l’IA... ✨');

    try {
      const currentSettings = settings || {
        llmProvider: 'mistral',
        apiKey: '',
        modelName: 'mistral-small-latest',
        defaultGPS: 'google_maps',
        theme: 'dark'
      };

      const newPlan = await customPromptEditDayWithLLM(
        activeTrip.destination,
        selectedDay.title,
        activities,
        instruction.trim(),
        currentSettings
      );

      await db.days.update(selectedDay.id!, {
        title: newPlan.title,
        summary: newPlan.summary
      });

      await db.activities.where('dayId').equals(selectedDay.id!).delete();
      const newActsToInsert = newPlan.activities.map((a, idx) => ({
        dayId: selectedDay.id!,
        time: a.time,
        title: a.title,
        description: a.description,
        category: a.category,
        locationName: a.locationName,
        address: a.address,
        durationMinutes: a.durationMinutes || 60,
        priceEstimate: a.priceEstimate,
        completed: false,
        order: idx + 1
      }));
      await db.activities.bulkAdd(newActsToInsert);

      setCustomAIPrompt('');
      showToast('Journée ajustée selon vos instructions ! ✨');
    } catch (err: any) {
      console.error(err);
      showToast(`Erreur : ${err.message || 'Impossible d’ajuster.'}`);
    } finally {
      setIsReoptimizing(false);
    }
  };

  const handleRePlanDay = async (mode: 'rain' | 'lighter' | 'epicurean') => {
    if (!selectedDay || !activities || !activeTrip) return;
    setIsReoptimizing(true);
    showToast('Ré-optimisation par l’IA en cours... ✨');

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

      await db.days.update(selectedDay.id!, {
        title: newPlan.title,
        summary: newPlan.summary
      });

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

  const handleShareItinerary = () => {
    if (!selectedDay || !activities) return;

    let text = `🗓️ *${activeTrip?.destination} — ${selectedDay.title}*\n`;
    text += `📝 ${selectedDay.summary}\n`;
    text += `💰 Estimation jour: ${formatPrice(dayTotalEstimatedCost, activeTrip?.currency)}\n\n`;

    activities.forEach(a => {
      text += `⏱️ *${a.time}* : ${a.title} ${a.priceEstimate ? `(${a.priceEstimate})` : ''}\n📍 ${a.locationName}\n\n`;
    });

    navigator.clipboard.writeText(text);
    showToast('Planning copié dans le presse-papier !');
  };

  const completedCount = activities?.filter(a => a.completed).length || 0;
  const totalCount = activities?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const defaultGPS = settings?.defaultGPS || 'google_maps';
  const partnerId = settings?.affiliatePartnerId || '';

  const bookingUrl = activeTrip ? getBookingUrl(activeTrip.destination, partnerId) : '#';

  if (!activeTrip) {
    return (
      <>
        <LandingHero
          onStartPlanning={() => setActiveTab('ai_planner')}
          onOpenSurprise={() => setShowSurpriseModal(true)}
        />
        <SurprisePlannerModal
          isOpen={showSurpriseModal}
          onClose={() => setShowSurpriseModal(false)}
        />
      </>
    );
  }

  return (
    <div className="space-y-4 pb-40">
      
      {/* Active Trip Header Card */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-5 border border-slate-800 shadow-xl">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
          style={{ backgroundImage: `url(${activeTrip.coverImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 bg-blue-500/15 border border-blue-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                <span className="truncate">{activeTrip.destination}</span>
              </span>
              
              {/* Weather Widget */}
              {weather && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-200 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-full">
                  <span>{weather.icon}</span>
                  <span>{weather.temperature}°C</span>
                </span>
              )}

              {/* DYNAMIC ESTIMATED TOTAL TRIP COST BADGE */}
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full shadow-sm">
                <Wallet className="w-3 h-3 text-emerald-400 shrink-0" />
                Est. Séjour: ~{formatPrice(tripTotalEstimatedCost, activeTrip.currency)}
              </span>

            {/* CLICKABLE BOOKING LINKS SECTION WITH EXPLICIT CALLOUT */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider flex items-center gap-1 font-mono">
                <span>💡 Réservez en 1 clic :</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* GLOBAL GETYOURGUIDE EXCURSIONS & ACTIVITIES BUTTON */}
                <a
                  href={getGetYourGuideHubUrl(activeTrip.destination, partnerId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-purple-200 bg-purple-500/20 border border-purple-500/50 ring-1 ring-purple-400/30 px-3 py-1.5 rounded-full hover:bg-purple-500/35 hover:scale-105 transition-all shadow-md active:scale-95 cursor-pointer"
                  title="Découvrir les excursions, visites & activités du séjour"
                >
                  <Ticket className="w-3.5 h-3.5 text-purple-400" />
                  <span>🎟️ Excursions & Billets</span>
                  <ExternalLink className="w-3 h-3 text-purple-300" />
                </a>

                {/* AFFILIATE HOTEL BOOKING BUTTON */}
                <a
                  href={bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-amber-200 bg-amber-500/20 border border-amber-500/50 ring-1 ring-amber-400/30 px-3 py-1.5 rounded-full hover:bg-amber-500/35 hover:scale-105 transition-all shadow-md active:scale-95 cursor-pointer"
                  title="Trouver un hôtel sur Booking.com"
                >
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  <span>🏨 Hôtels</span>
                  <ExternalLink className="w-3 h-3 text-amber-300" />
                </a>

                {/* AFFILIATE TRAIN BUTTON */}
                <a
                  href={getTrainlineUrl(activeTrip.destination)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-sky-200 bg-sky-500/20 border border-sky-500/50 ring-1 ring-sky-400/30 px-3 py-1.5 rounded-full hover:bg-sky-500/35 hover:scale-105 transition-all shadow-md active:scale-95 cursor-pointer"
                  title="Réserver un billet de train"
                >
                  <span>🚆 Trains</span>
                  <ExternalLink className="w-3 h-3 text-sky-300" />
                </a>

                {/* AFFILIATE FLIGHT BUTTON */}
                <a
                  href={getFlightUrl(activeTrip.airportIata || activeTrip.nearestAirport || activeTrip.destination, partnerId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-indigo-200 bg-indigo-500/20 border border-indigo-500/50 ring-1 ring-indigo-400/30 px-3 py-1.5 rounded-full hover:bg-indigo-500/35 hover:scale-105 transition-all shadow-md active:scale-95 cursor-pointer"
                  title="Comparer et réserver un vol"
                >
                  <span>✈️ Vols</span>
                  <ExternalLink className="w-3 h-3 text-indigo-300" />
                </a>

                {/* AFFILIATE CAR RENTAL BUTTON */}
                <a
                  href={getCarRentalUrl(activeTrip.destination, partnerId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-200 bg-emerald-500/20 border border-emerald-500/50 ring-1 ring-emerald-400/30 px-3 py-1.5 rounded-full hover:bg-emerald-500/35 hover:scale-105 transition-all shadow-md active:scale-95 cursor-pointer"
                  title="Louer une voiture ou un scooter"
                >
                  <Car className="w-3.5 h-3.5 text-emerald-400" />
                  <span>🚗 Voitures</span>
                  <ExternalLink className="w-3 h-3 text-emerald-300" />
                </a>
              </div>
            </div>
            </div>

            <h2 className="text-xl font-extrabold text-white tracking-tight font-display leading-snug">
              {activeTrip.title}
            </h2>
          </div>

          {/* List / Map Switcher */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 p-0.5 rounded-2xl shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl text-xs transition-all ${
                viewMode === 'list' ? 'bg-blue-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-xl text-xs transition-all ${
                viewMode === 'map' ? 'bg-blue-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
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

      {/* 1. LOGISTIQUE EN HAUT DE PAGE: COMMENT S'Y RENDRE ? */}
      <div className="glass-panel rounded-3xl p-4 border border-blue-500/30 bg-gradient-to-r from-slate-900/90 via-indigo-950/40 to-slate-900/90 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center">
              <Plane className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white font-display">Comment s'y rendre ?</h3>
              <p className="text-[10px] text-slate-400">Logistique recommandée par l'IA</p>
            </div>
          </div>
          {logistics.recommendedTransport && (
            <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/40 px-2.5 py-1 rounded-full">
              ⚡ {logistics.recommendedTransport}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
          {/* Gare SNCF */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-base">🚆</span>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Gare SNCF la plus proche</div>
                <div className="font-semibold text-slate-100">{logistics.nearestTrainStation}</div>
              </div>
            </div>
            <a
              href={getTrainlineUrl(activeTrip.destination)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-extrabold text-sky-300 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 px-2.5 py-1 rounded-xl transition-all shrink-0 cursor-pointer"
            >
              Trains ↗
            </a>
          </div>

          {/* Aéroport */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-base">✈️</span>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Aéroport le plus proche</div>
                <div className="font-semibold text-slate-100">
                  {logistics.nearestAirport}
                </div>
              </div>
            </div>
            <a
              href={getFlightUrl(logistics.airportIata || logistics.nearestAirport || activeTrip.destination, partnerId)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-extrabold text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 px-2.5 py-1 rounded-xl transition-all shrink-0 cursor-pointer"
            >
              Vols ↗
            </a>
          </div>
        </div>
      </div>



      {/* Selected Day Header & Dynamic Daily Cost */}
      {selectedDay && (
        <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-3.5 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0 flex-1">
              <h3 className="font-bold text-base text-slate-100 font-display leading-snug">
                {selectedDay.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {selectedDay.summary}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full shadow-sm">
                <Wallet className="w-3 h-3 text-emerald-400" />
                Est. Jour: ~{formatPrice(dayTotalEstimatedCost, activeTrip.currency)}
              </span>

              <div className="flex items-center gap-1 mt-1">
                <button
                  onClick={() => setShowAIPromptBar(!showAIPromptBar)}
                  className={`p-2 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1.5 ${
                    showAIPromptBar
                      ? 'bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/30'
                      : 'bg-slate-900/90 text-purple-300 border-purple-500/30 hover:border-purple-400'
                  }`}
                  title="Modifier avec l’IA"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                  <span className="text-[11px]">Modifier par AI</span>
                </button>

                {/* QR CODE SHARE BUTTON */}
                <button
                  onClick={() => setShowQRModal(true)}
                  className="p-2 text-purple-300 hover:text-purple-100 rounded-xl bg-purple-950/40 border border-purple-500/30"
                  title="Partager par QR Code"
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleShareItinerary}
                  className="p-2 text-slate-400 hover:text-blue-400 rounded-xl bg-slate-900 border border-slate-800"
                  title="Partager sur WhatsApp"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
              <span>Progression du jour</span>
              <span className="text-emerald-400 font-bold">{progressPercent}% Fait</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* CUSTOM AI PROMPT INTERACTIVE BAR */}
          {showAIPromptBar && (
            <div className="pt-3 border-t border-purple-500/30 space-y-2 animate-fadeIn bg-purple-950/20 p-3.5 rounded-2xl border border-purple-500/20 shadow-inner">
              <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                Demandez à l'IA d'ajuster votre déroulé :
              </div>

              <form onSubmit={handleCustomAIPromptSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: Remplace le resto par une pizzeria, Décale tout de 1h..."
                  value={customAIPrompt}
                  onChange={(e) => setCustomAIPrompt(e.target.value)}
                  disabled={isReoptimizing}
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-purple-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isReoptimizing || !customAIPrompt.trim()}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center gap-1 shadow-lg disabled:opacity-50"
                >
                  {isReoptimizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </form>

              {/* Suggestions Presets Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  "🍕 Pizzeria typique à midi",
                  "⏰ Décale tout de +1h",
                  "🛍️ Pause shopping vintage 16h",
                  "🚶 Parcours 100% à pied",
                  "☕ Pause café viennois"
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleCustomAIPromptSubmit(undefined, preset)}
                    disabled={isReoptimizing}
                    className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-purple-500/40 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Presets Quick Actions Bar */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" /> Presets de ré-optimisation :
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                disabled={isReoptimizing}
                onClick={() => handleRePlanDay('rain')}
                className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-semibold hover:bg-blue-500/20 transition-all"
              >
                {isReoptimizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudRain className="w-3.5 h-3.5 text-blue-400" />}
                <span>Il pleut ! 🌧️</span>
              </button>
              <button
                disabled={isReoptimizing}
                onClick={() => handleRePlanDay('lighter')}
                className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold hover:bg-amber-500/20 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Trop chargé ⚡️</span>
              </button>
              <button
                disabled={isReoptimizing}
                onClick={() => handleRePlanDay('epicurean')}
                className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-2xl bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold hover:bg-purple-500/20 transition-all"
              >
                <Utensils className="w-3.5 h-3.5 text-purple-400" />
                <span>Épicurien 🍷</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main View: List or Interactive Map */}
      {viewMode === 'map' ? (
        <MapView activities={activities || []} defaultGPS={defaultGPS} destination={activeTrip?.destination} />
      ) : (
        <div className="space-y-3.5 pt-1">
          {activities && activities.length > 0 ? (
            activities.map((act, index) => (
              <ActivityCard
                key={act.id}
                activity={act}
                prevActivity={index > 0 ? activities[index - 1] : undefined}
                defaultGPS={defaultGPS}
                partnerId={partnerId}
                destination={activeTrip?.destination}
                onToggleComplete={handleToggleComplete}
                onEdit={(actToEdit) => {
                  setEditingActivity(actToEdit);
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteActivity}
              />
            ))
          ) : (
            <div className="text-center py-10 glass-panel rounded-3xl border border-slate-800/80 p-6 space-y-3">
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

      {/* QR Code Share Modal */}
      {activeTrip && days && (
        <QRCodeShareModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          trip={activeTrip}
          days={days}
          activities={allTripActivities || []}
        />
      )}

      {/* Surprise Planner Modal */}
      <SurprisePlannerModal
        isOpen={showSurpriseModal}
        onClose={() => setShowSurpriseModal(false)}
      />
    </div>
  );
};
