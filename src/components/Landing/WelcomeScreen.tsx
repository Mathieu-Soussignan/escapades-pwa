import React, { useState } from 'react';
import { Sparkles, Compass, ArrowRight, MapPin, ShieldCheck, QrCode, CloudSun, Zap, Heart, Plane } from 'lucide-react';

interface WelcomeScreenProps {
  onEnterApp: (destination?: string) => void;
  onOpenSurprise: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onEnterApp,
  onOpenSurprise
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [takeoffProgress, setTakeoffProgress] = useState(0);
  const [takeoffStatus, setTakeoffStatus] = useState("Préparation du vol...");

  const handleStartJourney = (action: () => void) => {
    setIsExiting(true);
    setTakeoffProgress(15);
    setTakeoffStatus("Vérification de la météo & carte...");

    // Smooth status progression during 1.6s cinematic flight
    setTimeout(() => {
      setTakeoffProgress(55);
      setTakeoffStatus("Décollage imminent... ✈️");
    }, 500);

    setTimeout(() => {
      setTakeoffProgress(90);
      setTakeoffStatus("Arrivée sur vos Escapades ! 🌍");
    }, 1100);

    setTimeout(() => {
      setTakeoffProgress(100);
      action();
    }, 1600); // 1.6 seconds smooth cinematic flight transition
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between p-6 bg-slate-950 text-slate-100 overflow-y-auto no-scrollbar transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isExiting ? 'opacity-0 scale-125 filter blur-xl pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* GOD TIER S++ CINEMATIC TAKEOFF OVERLAY */}
      {isExiting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none animate-fadeIn bg-slate-950/80 backdrop-blur-2xl">
          {/* Expanding Radial Warp Portal */}
          <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-blue-500/40 via-purple-500/40 to-pink-500/40 blur-3xl animate-ping scale-150" />
          
          {/* Flying Jet Icon Takeoff Animation */}
          <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6 max-w-xs">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-1 shadow-2xl shadow-blue-500/50 flex items-center justify-center animate-pulse">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                <Plane className="w-12 h-12 text-white animate-bounce transform -rotate-45" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-base font-extrabold text-white font-display tracking-tight">
                {takeoffStatus}
              </span>
              <p className="text-xs text-slate-400">Installez-vous confortablement...</p>
            </div>

            {/* Cinematic Progress Bar */}
            <div className="w-full bg-slate-900 border border-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${takeoffProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Immersive Travel Hero Background Image */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isExiting ? 'scale-150 opacity-10 filter blur-lg' : 'opacity-35 scale-105'
        }`}
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-slate-950" />

      {/* Decorative Glowing Ambient Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-tr from-blue-600/30 via-purple-600/30 to-pink-600/20 blur-3xl rounded-full pointer-events-none" />

      {/* Top Header Logo */}
      <header className="relative z-10 flex items-center justify-between max-w-md mx-auto w-full pt-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            Escapades
          </span>
        </div>

        <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/25 px-3 py-1 rounded-full uppercase tracking-wider">
          IA Travel Planner
        </span>
      </header>

      {/* Center Hero Content */}
      <main className="relative z-10 max-w-md mx-auto w-full my-auto space-y-6 text-center pt-8 pb-8">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-purple-500/40 text-purple-300 text-xs font-bold shadow-xl animate-bounce-slow">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>L'Intelligence Artificielle au service de vos voyages</span>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-white font-display tracking-tight leading-tight">
            Chaque week-end devient une <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Échappée Belle</span>.
          </h1>
          <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed font-sans">
            Itinéraires sur mesure minute par minute, cartes sombres interactives, météo live et réservations d'activités au meilleur prix.
          </p>
        </div>

        {/* Interactive Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2 pt-2 text-[11px] font-semibold text-slate-300">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <MapPin className="w-3.5 h-3.5 text-rose-400" /> Carte Sombre GPS
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <CloudSun className="w-3.5 h-3.5 text-amber-400" /> Météo Live
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <QrCode className="w-3.5 h-3.5 text-purple-400" /> Partage QR 1s
          </span>
        </div>

        {/* Main Journey Action Buttons */}
        <div className="space-y-3 pt-4 max-w-xs mx-auto">
          
          <button
            onClick={() => handleStartJourney(() => onEnterApp())}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-sm shadow-2xl shadow-blue-500/35 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all group"
          >
            <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
            <span>✈️ Embargo : Commencer mon voyage</span>
            <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => handleStartJourney(() => onOpenSurprise())}
            className="w-full py-3 px-5 rounded-2xl bg-purple-950/50 border border-purple-500/40 text-purple-200 font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-purple-900/50 transition-all active:scale-95 shadow-lg"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>✨ Mode "Inspire-Moi !" (Pépite autour de moi)</span>
          </button>

        </div>

      </main>

      {/* Bottom Reassurance Footer */}
      <footer className="relative z-10 max-w-md mx-auto w-full pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Gratuit & Sans Inscription</span>
        </div>

        <div className="flex items-center gap-1 text-slate-500">
          <span>Créé avec</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
        </div>
      </footer>

    </div>
  );
};
