import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { useLiveQuery } from 'dexie-react-hooks';
import { generateItineraryWithLLM } from '../../services/llmService';
import type { VibeStyle } from '../../types';
import { Sparkles, MapPin, Calendar, Loader2 } from 'lucide-react';

export const AIPlannerWizard: React.FC = () => {
  const { setActiveTripId, setActiveTab, showToast } = useApp();
  const settings = useLiveQuery(() => db.settings.toCollection().first(), []);

  const [destination, setDestination] = useState('');
  const [durationDays, setDurationDays] = useState(3);
  const [vibe, setVibe] = useState<VibeStyle>('balanced');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Gastronomie', 'Culture']);
  const [budget, setBudget] = useState<'budget' | 'medium' | 'premium'>('medium');
  const [transportMode, setTransportMode] = useState<'car' | 'transit' | 'walking'>('car');
  const [customNotes, setCustomNotes] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Analyse du prompt...');

  const interestOptions = [
    'Culture & Musées',
    'Gastronomie',
    'Nature & Rando',
    'Incontournables',
    'Pépites cachées',
    'Photos & Panoramas',
    'Détente & Spa',
    'Vie nocturne',
    'Artisanat & Shopping'
  ];

  const toggleInterest = (item: string) => {
    if (selectedInterests.includes(item)) {
      setSelectedInterests(selectedInterests.filter(i => i !== item));
    } else {
      setSelectedInterests([...selectedInterests, item]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setIsGenerating(true);
    setLoadingStep(`Exploration des meilleures adresses à ${destination}...`);

    try {
      setTimeout(() => setLoadingStep("Génération de la timeline jour par jour..."), 800);
      setTimeout(() => setLoadingStep("Optimisation des trajets GPS..."), 1400);

      const currentSettings = settings || {
        llmProvider: 'openai',
        apiKey: '',
        modelName: 'gpt-4o',
        defaultGPS: 'google_maps',
        theme: 'dark'
      };

      const result = await generateItineraryWithLLM(
        {
          destination: destination.trim(),
          durationDays,
          vibe,
          interests: selectedInterests,
          budget,
          transportMode,
          customNotes
        },
        currentSettings
      );

      // Save to IndexedDB
      const tripId = await db.trips.add({
        title: result.title,
        destination: result.destination,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + durationDays * 86400000).toISOString().split('T')[0],
        coverImage: result.coverImage,
        vibe,
        notes: result.vibeSummary,
        status: 'active',
        createdAt: new Date().toISOString()
      });

      for (const day of result.days) {
        const dayId = await db.days.add({
          tripId: tripId as number,
          dayNumber: day.dayNumber,
          title: day.title,
          summary: day.summary
        });

        const activitiesToInsert = day.activities.map((act, index) => ({
          dayId: dayId as number,
          time: act.time,
          title: act.title,
          description: act.description,
          category: act.category,
          locationName: act.locationName,
          address: act.address,
          latitude: act.latitude,
          longitude: act.longitude,
          durationMinutes: act.durationMinutes || 60,
          priceEstimate: act.priceEstimate,
          completed: false,
          order: index + 1
        }));

        await db.activities.bulkAdd(activitiesToInsert);
      }

      showToast(`Escapade à ${destination} générée avec succès ! ✨`);
      setActiveTripId(tripId as number);
      setActiveTab('timeline');
    } catch (err: any) {
      console.error(err);
      showToast(`Erreur de génération : ${err.message || 'Veuillez réessayer.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-5 border border-indigo-500/30 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-blue-600/30 to-purple-600/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25 shrink-0">
            <Sparkles className="w-6 h-6 text-white animate-pulse-subtle" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white font-display">
              Générateur d'Escapade AI
            </h2>
            <p className="text-xs text-slate-300">
              Créez un itinéraire sur-mesure optimisé jour par jour
            </p>
          </div>
        </div>
      </div>

      {/* Main Wizard Form */}
      <form onSubmit={handleGenerate} className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-4 text-xs">
        
        {/* Destination */}
        <div>
          <label className="block font-bold text-slate-200 mb-1 flex items-center gap-1.5 text-sm">
            <MapPin className="w-4 h-4 text-rose-400" />
            Où souhaitez-vous vous évader ? *
          </label>
          <input
            type="text"
            placeholder="Ex: Annecy, Kyoto, Rome, Chamonix, Barcelone..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl px-4 py-3 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Duration Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5 font-semibold text-slate-300">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" /> Durée du séjour
            </span>
            <span className="text-sm font-bold text-blue-400 font-mono bg-blue-500/10 px-2.5 py-0.5 rounded-full">
              {durationDays} {durationDays > 1 ? 'jours' : 'jour'}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="7"
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            className="w-full accent-blue-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Vibe Selection */}
        <div>
          <label className="block font-bold text-slate-300 mb-1.5">
            Style & Ambiance
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'balanced', label: 'Équilibré', icon: '⚖️', desc: 'Mix visites & détente' },
              { id: 'nature_adventure', label: 'Nature & Rando', icon: '🏔️', desc: 'Grands espaces' },
              { id: 'cultural', label: 'Culture & Art', icon: '🏛️', desc: 'Musées & histoire' },
              { id: 'gastronomic', label: 'Gourmand', icon: '🍷', desc: 'Restos & terroir' },
              { id: 'romantic', label: 'Romantique', icon: '💖', desc: 'Coucher de soleil & poésie' },
              { id: 'relaxed', label: 'Détente & Zen', icon: '🌿', desc: 'Pas de stress' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setVibe(item.id as VibeStyle)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  vibe === item.id
                    ? 'bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-blue-500 text-white font-bold ring-1 ring-blue-500 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <span>{item.icon}</span> {item.label}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Interests Badges */}
        <div>
          <label className="block font-bold text-slate-300 mb-1.5">
            Centres d'intérêt spécifiques
          </label>
          <div className="flex flex-wrap gap-1.5">
            {interestOptions.map((item) => {
              const isSelected = selectedInterests.includes(item);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleInterest(item)}
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-medium transition-all ${
                    isSelected
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300 font-bold'
                      : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '}{item}
                </button>
              );
            })}
          </div>
        </div>

        {/* Budget & Transport */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Budget</label>
            <div className="flex rounded-xl overflow-hidden border border-slate-800 p-0.5 bg-slate-900">
              {[
                { id: 'budget', label: '€' },
                { id: 'medium', label: '€€' },
                { id: 'premium', label: '€€€' }
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBudget(b.id as any)}
                  className={`flex-1 py-1.5 text-center font-bold transition-all rounded-lg ${
                    budget === b.id ? 'bg-blue-600 text-white shadow' : 'text-slate-400'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Transport principal</label>
            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-medium focus:outline-none"
            >
              <option value="car">🚗 Voiture / Waze</option>
              <option value="transit">🚌 Transports</option>
              <option value="walking">🚶‍♂️ À pied</option>
            </select>
          </div>
        </div>

        {/* Custom Prompt Notes */}
        <div>
          <label className="block font-bold text-slate-300 mb-1">
            Instructions spéciales pour l'AI (optionnel)
          </label>
          <textarea
            rows={2}
            placeholder="Ex: Inclure un restaurant végétarien le soir, éviter les musées le lundi..."
            value={customNotes}
            onChange={(e) => setCustomNotes(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl px-3 py-2 text-slate-100 focus:border-indigo-500 focus:outline-none resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 hover:opacity-95 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{loadingStep}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Générer mon escapade AI ✨</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
};
