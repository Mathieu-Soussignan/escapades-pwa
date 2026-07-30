import React from 'react';
import { Sparkles, MapPin, Compass, ShieldCheck, QrCode, ArrowRight, Zap, CloudSun } from 'lucide-react';

interface LandingHeroProps {
  onStartPlanning: () => void;
  onOpenSurprise: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartPlanning,
  onOpenSurprise
}) => {
  return (
    <div className="space-y-6 pb-20 animate-fadeIn">
      
      {/* Main Hero Card */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-6 border border-slate-800 shadow-2xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 text-center space-y-5">
        
        {/* Glowing Background Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/20 blur-3xl rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          Planificateur d'Escapades par Intelligence Artificielle
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white font-display tracking-tight leading-tight">
            Votre prochain week-end planifié en <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">5 secondes</span>.
          </h1>
          <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
            Laissez l'IA construire votre séjour minute par minute avec carte interactive, météo live, budget estimé et conseils secrets.
          </p>
        </div>

        {/* Dual Primary Call-To-Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2 max-w-xs mx-auto">
          <button
            onClick={onStartPlanning}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-xs shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Créer mon Escapade avec l'IA</span>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </button>

          <button
            onClick={onOpenSurprise}
            className="w-full py-3 px-5 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-purple-200 font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-purple-900/40 transition-all active:scale-95 shadow-md"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>✨ Mode "Inspire-Moi !" (Surprise près de chez moi)</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center gap-4 text-[10px] text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Gratuit</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Sans Inscription</span>
          </div>
          <div className="flex items-center gap-1">
            <QrCode className="w-3.5 h-3.5 text-purple-400" />
            <span>Partage QR</span>
          </div>
        </div>

      </div>

      {/* Feature Highlights Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-panel rounded-3xl p-4 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <MapPin className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-xs font-display">Carte & Météo Live</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Visualisez le tracé de vos journées et la météo en direct sur la destination.
          </p>
        </div>

        <div className="glass-panel rounded-3xl p-4 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <CloudSun className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-white text-xs font-display">Ré-optimisation IA</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Un imprévu ou de la pluie ? L'IA ré-ajuste le planning en 1 clic.
          </p>
        </div>
      </div>

    </div>
  );
};
