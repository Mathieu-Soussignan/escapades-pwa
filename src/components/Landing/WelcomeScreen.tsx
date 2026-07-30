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
    setTakeoffProgress(20);
    setTakeoffStatus("Vérification de la météo & itinéraire...");

    setTimeout(() => {
      setTakeoffProgress(60);
      setTakeoffStatus("Décollage imminent... ✈️");
    }, 600);

    setTimeout(() => {
      setTakeoffProgress(90);
      setTakeoffStatus("Arrivée sur vos Escapades ! 🌍");
    }, 1200);

    setTimeout(() => {
      setTakeoffProgress(100);
      action();
    }, 1700);
  };

  return (
    <>
      {/* GOD TIER S++ STANDALONE TAKEOFF OVERLAY */}
      {isExiting && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-slate-950/90 backdrop-blur-3xl text-slate-100 animate-fadeIn">
          
          {/* Ambient Glowing Portal */}
          <div className="absolute w-96 h-96 rounded-full bg-gradient-to-tr from-blue-600/40 via-purple-600/40 to-pink-600/30 blur-3xl animate-pulse" />

          <div className="relative z-10 flex flex-col items-center gap-5 text-center max-w-xs w-full bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl">
            
            {/* Animated Flying Jet Icon */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-1 shadow-2xl shadow-blue-500/50 flex items-center justify-center animate-bounce-slow">
              <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                <Plane className="w-10 h-10 text-white transform -rotate-45" />
              </div>
            </div>

            {/* Status Text */}
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white font-display tracking-tight">
                {takeoffStatus}
              </h3>
              <p className="text-xs text-slate-300">Installez-vous confortablement...</p>
            </div>

            {/* Live Animated Progress Bar */}
            <div className="w-full bg-slate-950/80 border border-slate-700/80 h-3 rounded-full overflow-hidden shadow-inner p-0.5">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${takeoffProgress}%` }}
              />
            </div>

            <span className="text-[11px] font-bold text-purple-300 font-mono">
              {takeoffProgress}%
            </span>

          </div>
        </div>
      )}

      {/* Main Landing Screen */}
      <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 bg-slate-950 text-slate-100 overflow-y-auto no-scrollbar">
        
        {/* Vibrant & Immersive Travel Background Image (75% Opacity) */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-75 scale-105 transition-all duration-1000"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop')` }}
        />
        
        {/* Subtle Ambient Contrast Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/30 to-slate-950/80 pointer-events-none" />

        {/* Decorative Glowing Ambient Lights */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/30 via-purple-600/25 to-pink-600/20 blur-3xl rounded-full pointer-events-none" />

        {/* Top Header Logo with Official Brand Image */}
        <header className="relative z-10 flex items-center justify-between max-w-md mx-auto w-full pt-safe-header">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shadow-2xl shadow-blue-500/40 border-2 border-white/80 ring-2 ring-blue-500/40 flex items-center justify-center overflow-hidden shrink-0 hover:scale-105 transition-all">
              <img src="/escapade_logo.png" alt="Escapades Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-2xl tracking-tight font-display text-white drop-shadow-xl leading-none">
                Escapades
              </span>
              <span className="text-[10px] font-bold text-blue-200 font-sans tracking-wide mt-1 drop-shadow">
                Votre voyage, uniquement le vôtre
              </span>
            </div>
          </div>

          <span className="text-[11px] font-bold text-blue-200 bg-slate-900/60 backdrop-blur-xl border border-white/20 px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-xl">
            IA Travel Planner
          </span>
        </header>

        {/* Center Hero Content wrapped in GOD TIER S++ Crystal Liquid Glass Card */}
        <main className="relative z-10 max-w-md mx-auto w-full my-auto space-y-5 text-center pt-6 pb-6">
          
          <div className="bg-slate-900/45 backdrop-blur-2xl p-7 rounded-[2.5rem] border border-white/25 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] space-y-5">
            
            {/* Animated Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-purple-400/40 text-purple-200 text-xs font-bold shadow-lg">
              <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
              <span>L'IA au service de vos voyages</span>
            </div>

            {/* Hero Title & Subtitle */}
            <div className="space-y-2.5">
              <h1 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight leading-tight drop-shadow-xl">
                Chaque week-end devient une <span className="bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">Échappée Belle</span>.
              </h1>
              <p className="text-xs text-slate-200 max-w-xs mx-auto leading-relaxed font-sans drop-shadow-md">
                Itinéraires sur mesure minute par minute, cartes sombres interactives, météo live et réservations d'activités.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-2 pt-1 text-[11px] font-semibold text-slate-100">
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/15 shadow-md">
                <MapPin className="w-3.5 h-3.5 text-rose-400" /> Carte Sombre GPS
              </span>
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/15 shadow-md">
                <CloudSun className="w-3.5 h-3.5 text-amber-400" /> Météo Live
              </span>
              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/15 shadow-md">
                <QrCode className="w-3.5 h-3.5 text-purple-400" /> Partage QR 1s
              </span>
            </div>

          </div>

          {/* Main Action Buttons */}
          <div className="space-y-3 pt-2 max-w-xs mx-auto">
            
            <button
              onClick={() => handleStartJourney(() => onEnterApp())}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-sm shadow-[0_15px_30px_-5px_rgba(59,130,246,0.5)] border border-white/30 flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-95 transition-all group cursor-pointer"
            >
              <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
              <span>✈️ Embarquement : Commencer mon voyage</span>
              <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => handleStartJourney(() => onOpenSurprise())}
              className="w-full py-3.5 px-5 rounded-2xl bg-slate-900/60 backdrop-blur-2xl border border-purple-400/40 text-purple-200 font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-purple-900/60 hover:border-purple-300 transition-all active:scale-95 shadow-xl cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>✨ Mode "Inspire-Moi !" (Pépite autour de moi)</span>
            </button>

          </div>

        </main>

        {/* Bottom Reassurance Footer */}
        <footer className="relative z-10 max-w-md mx-auto w-full pt-3 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-200 font-medium drop-shadow-md">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Gratuit & Sans Inscription</span>
          </div>

          <div className="flex items-center gap-1 text-slate-200">
            <span>Créé avec</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 animate-pulse" />
          </div>
        </footer>

      </div>
    </>
  );
};
