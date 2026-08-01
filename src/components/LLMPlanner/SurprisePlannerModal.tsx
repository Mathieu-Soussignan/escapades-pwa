import React, { useState } from 'react';
import { Sparkles, Loader2, Navigation, X, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { db } from '../../db/database';
import { generateTripWithLLM } from '../../services/llmService';
import type { VibeStyle } from '../../types';

interface SurprisePlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SurprisePlannerModal: React.FC<SurprisePlannerModalProps> = ({
  isOpen,
  onClose
}) => {
  const { setActiveTripId, setActiveTab, showToast } = useApp();

  const [radiusKm, setRadiusKm] = useState(50);
  const [vibe, setVibe] = useState<VibeStyle>('nature_adventure');
  const [isLocating, setIsLocating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast('Géolocalisation non supportée par votre navigateur.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsLocating(false);
        showToast('Position détectée ! 📍');
      },
      (err) => {
        console.warn(err);
        setIsLocating(false);
        showToast('Impossible d’accéder à la position. Utilisation de la région par défaut.');
      },
      { timeout: 8000 }
    );
  };

  const handleGenerateSurprise = async () => {
    setIsGenerating(true);
    showToast('Recherche de l’escapade surprise idéale... 🪄');

    try {
      const settings = await db.settings.toCollection().first();
      const currentSettings = settings || {
        llmProvider: 'mistral',
        apiKey: '',
        modelName: 'mistral-small-latest',
        defaultGPS: 'google_maps',
        theme: 'dark'
      };

      const promptLocation = userCoords 
        ? `ma position GPS (${userCoords.lat.toFixed(2)}, ${userCoords.lng.toFixed(2)})`
        : `la région actuelle de l'utilisateur en France`;

      const reqPayload = {
        destination: `Pépite surprise à moins de ${radiusKm} km de ${promptLocation}`,
        durationDays: 1,
        vibe: vibe,
        withChildren: false,
        budget: 'medium' as const,
        customNotes: `Recherche exclusivement une destination pépite, village de charme, lac ou parc naturel situé dans un rayon strict de maximum ${radiusKm} km.`
      };

      const plan = await generateTripWithLLM(reqPayload, currentSettings);

      const newTripId = await db.trips.add({
        title: plan.title,
        destination: plan.destination,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        coverImage: plan.coverImage || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
        vibe: vibe,
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
        const d = plan.days[idx];
        const dayId = await db.days.add({
          tripId: newTripId as number,
          dayNumber: idx + 1,
          date: new Date().toISOString().split('T')[0],
          title: d.title,
          summary: d.summary
        });

        const actsToAdd = d.activities.map((a, aIdx) => ({
          dayId: dayId as number,
          time: a.time,
          title: a.title,
          description: a.description,
          category: a.category,
          locationName: a.locationName,
          address: a.address || '',
          durationMinutes: a.durationMinutes || 60,
          priceEstimate: a.priceEstimate || 'Gratuit',
          completed: false,
          order: aIdx + 1
        }));

        await db.activities.bulkAdd(actsToAdd);
      }

      setActiveTripId(newTripId as number);
      showToast('Escapade surprise créée ! 🎉');
      onClose();
      setActiveTab('timeline');
    } catch (err: any) {
      console.error(err);
      showToast(`Erreur : ${err.message || 'Impossible de générer.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm glass-panel rounded-3xl p-5 border border-purple-500/30 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5 font-bold text-slate-100 text-sm font-display">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>✨ Mode "Inspire-Moi !"</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Vous ne savez pas quoi faire ? L'IA trouve la pépite idéale autour de vous !
        </p>

        {/* Location Detection Button */}
        <button
          onClick={handleDetectLocation}
          disabled={isLocating}
          className="w-full py-2.5 px-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-between transition-all"
        >
          <div className="flex items-center gap-2">
            <Navigation className={`w-4 h-4 ${userCoords ? 'text-emerald-400' : 'text-blue-400'}`} />
            <span>{userCoords ? 'Position GPS activée' : 'Détecter ma position actuelle'}</span>
          </div>
          {isLocating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : userCoords ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <span className="text-[10px] text-blue-400">GPS</span>
          )}
        </button>

        {/* Max Distance Radius Slider */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-300">Rayon maximal autour de moi :</span>
            <span className="text-purple-400 font-extrabold text-sm">{radiusKm} km</span>
          </div>
          <input
            type="range"
            min="10"
            max="150"
            step="10"
            value={radiusKm}
            onChange={(e) => setRadiusKm(parseInt(e.target.value))}
            className="w-full accent-purple-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>10 km (Tout près)</span>
            <span>150 km (Grand week-end)</span>
          </div>
        </div>

        {/* Vibe Selection Chips */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-semibold text-slate-300">Ambiance recherchée :</label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'nature_adventure', label: '🌿 Nature & Lacs' },
              { id: 'romantic', label: '💖 Romantique' },
              { id: 'gastronomic', label: '🍷 Gastronomie' },
              { id: 'cultural', label: '🏰 Patrimoine' }
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setVibe(v.id as VibeStyle)}
                className={`py-2 px-2.5 rounded-xl border text-[11px] font-bold text-left transition-all ${
                  vibe === v.id
                    ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Generate Surprise Button */}
        <div className="pt-2">
          <button
            onClick={handleGenerateSurprise}
            disabled={isGenerating}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-extrabold text-xs shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Recherche de la pépite surprise...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Générer mon Escapade Surprise</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
