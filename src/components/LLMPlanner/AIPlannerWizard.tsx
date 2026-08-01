import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { useApp } from '../../context/AppContext';
import { generateTripWithLLM } from '../../services/llmService';
import type { VibeStyle, LLMPlanRequest } from '../../types';
import { Sparkles, MapPin, Calendar, Compass, Wallet, Users, Loader2 } from 'lucide-react';

export const AIPlannerWizard: React.FC = () => {
  const { setActiveTripId, setActiveTab, showToast } = useApp();
  const settings = useLiveQuery(() => db.settings.toCollection().first(), []);

  const [destination, setDestination] = useState('');
  const [daysCount, setDaysCount] = useState(2);
  const [vibe, setVibe] = useState<VibeStyle>('balanced');
  const [budget, setBudget] = useState<'small' | 'medium' | 'luxury'>('medium');
  const [travelers, setTravelers] = useState<'solo' | 'couple' | 'friends' | 'family'>('couple');
  const [customPreferences, setCustomPreferences] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setIsGenerating(true);
    showToast('Création de votre escapade sur mesure par l’IA en cours... ✨');

    try {
      const currentSettings = settings || {
        llmProvider: 'mistral',
        apiKey: '',
        modelName: 'mistral-small-latest',
        defaultGPS: 'google_maps',
        theme: 'dark'
      };

      const req: LLMPlanRequest = {
        destination,
        daysCount,
        vibe,
        budget,
        travelers,
        customPreferences
      };

      const plan = await generateTripWithLLM(req, currentSettings);

      const tripId = await db.trips.add({
        title: plan.title || `Séjour à ${destination}`,
        destination: plan.destination || destination,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + daysCount * 86400000).toISOString().split('T')[0],
        coverImage: plan.coverImage || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
        vibe,
        notes: plan.summary,
        budgetGoal: budget === 'small' ? 250 : budget === 'medium' ? 600 : 1500,
        currency: 'EUR',
        status: 'active',
        createdAt: new Date().toISOString(),
        nearestAirport: plan.nearestAirport,
        airportIata: plan.airportIata,
        nearestTrainStation: plan.nearestTrainStation,
        recommendedTransport: plan.recommendedTransport,
        hotelTiers: plan.hotelTiers
      });

      for (let idx = 0; idx < plan.days.length; idx++) {
        const dayPlan = plan.days[idx];
        const dayId = await db.days.add({
          tripId: tripId as number,
          dayNumber: idx + 1,
          date: new Date(Date.now() + idx * 86400000).toISOString().split('T')[0],
          title: dayPlan.title,
          summary: dayPlan.summary
        });

        const acts = dayPlan.activities.map((act: any, actIdx: number) => ({
          dayId: dayId as number,
          time: act.time || '10:00',
          title: act.title,
          description: act.description,
          category: act.category,
          locationName: act.locationName,
          address: act.address || '',
          durationMinutes: act.durationMinutes || 60,
          priceEstimate: act.priceEstimate || 'Gratuit',
          completed: false,
          order: actIdx + 1
        }));

        await db.activities.bulkAdd(acts);
      }

      setActiveTripId(tripId as number);
      showToast('Votre escapade a été créée avec succès ! 🎉');
      setActiveTab('timeline');
    } catch (err: any) {
      console.error('Generation failed:', err);
      showToast(`Erreur : ${err.message || 'Impossible de générer.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 text-xs">
      
      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-5 border border-purple-500/30 shadow-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-950">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400">
            Assistant IA Génératif
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-white font-display">
          Générer une Escapade sur Mesure
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-sm">
          Indiquez vos envies, le LLM crée vos journées minute par minute avec lieux, heures et tarifs !
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleGenerate} className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-4">
        
        {/* Destination */}
        <div>
          <label className="block font-bold text-slate-200 mb-1 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-rose-400" />
            Où souhaitez-vous partir ? *
          </label>
          <input
            type="text"
            placeholder="Ex: Rome, Florence, Cassis, Tokyo..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
            disabled={isGenerating}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 text-sm focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Days count */}
        <div>
          <label className="block font-bold text-slate-200 mb-1 flex items-center gap-1">
            <Calendar className="w-4 h-4 text-blue-400" />
            Durée du séjour (jours)
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5, 7].map((num) => (
              <button
                key={num}
                type="button"
                disabled={isGenerating}
                onClick={() => setDaysCount(num)}
                className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                  daysCount === num
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {num} {num === 1 ? 'jour' : 'jours'}
              </button>
            ))}
          </div>
        </div>

        {/* Vibe / Style */}
        <div>
          <label className="block font-bold text-slate-200 mb-1 flex items-center gap-1">
            <Compass className="w-4 h-4 text-emerald-400" />
            Style & Ambiance
          </label>
          <select
            value={vibe}
            onChange={(e) => setVibe(e.target.value as VibeStyle)}
            disabled={isGenerating}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 focus:border-purple-500 focus:outline-none"
          >
            <option value="balanced">⚖️ Équilibré (Incontournables & Pauses)</option>
            <option value="relaxed">🌿 Détente & Zen (Rythme doux)</option>
            <option value="intense">⚡ Intense & Sportif (Maximum de découvertes)</option>
            <option value="cultural">🏛️ Culture & Patrimoine (Musées & Histoire)</option>
            <option value="gastronomic">🍷 Gastronomique (Terroir & Bons restos)</option>
            <option value="nature_adventure">🏔️ Nature & Aventure (Rando & Grand air)</option>
            <option value="romantic">💖 Romantique (Coucher de soleil & Charme)</option>
          </select>
        </div>

        {/* Budget */}
        <div>
          <label className="block font-bold text-slate-200 mb-1 flex items-center gap-1">
            <Wallet className="w-4 h-4 text-amber-400" />
            Gamme de Budget
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'small', label: 'Économique', icon: '🌱' },
              { id: 'medium', label: 'Moyen', icon: '⚖️' },
              { id: 'luxury', label: 'Premium', icon: '✨' }
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                disabled={isGenerating}
                onClick={() => setBudget(b.id as any)}
                className={`py-2 rounded-xl border text-center transition-all ${
                  budget === b.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div>{b.icon} {b.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Travelers */}
        <div>
          <label className="block font-bold text-slate-200 mb-1 flex items-center gap-1">
            <Users className="w-4 h-4 text-pink-400" />
            Qui voyage ?
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'solo', label: 'Solo', icon: '👤' },
              { id: 'couple', label: 'Couple', icon: '👩‍❤️‍👨' },
              { id: 'friends', label: 'Amis', icon: '👯' },
              { id: 'family', label: 'Famille', icon: '👨‍👩‍👧' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                disabled={isGenerating}
                onClick={() => setTravelers(t.id as any)}
                className={`py-2 rounded-xl border text-center text-[11px] transition-all ${
                  travelers === t.id
                    ? 'bg-pink-500/20 border-pink-500 text-pink-200 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div>{t.icon}</div>
                <div>{t.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Preferences */}
        <div>
          <label className="block font-bold text-slate-200 mb-1">
            Instructions spécifiques (Optionnel)
          </label>
          <textarea
            rows={2}
            placeholder="Ex: Sans voiture, accès PMR, accent sur les spécialités de pâtes..."
            value={customPreferences}
            onChange={(e) => setCustomPreferences(e.target.value)}
            disabled={isGenerating}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-100 text-xs focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isGenerating || !destination.trim()}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-extrabold text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              Génération par l'IA en cours...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-purple-300" />
              Lancer la génération de l'escapade
            </>
          )}
        </button>

      </form>
    </div>
  );
};
