import React, { useState } from 'react';
import { Sparkles, MapPin, QrCode, ArrowRight, Check, Compass } from 'lucide-react';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartPlanning: () => void;
}

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
  onStartPlanning
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: "L'IA planifie votre escapade sur-mesure",
      subtitle: "Génération en 5 secondes",
      description: "Entrez votre destination ou laissez-vous surprendre. L'IA construit un planning minute par minute avec les plus beaux lieux, restos et activités.",
      icon: Sparkles,
      color: "from-blue-500 to-indigo-600",
      badge: "Intelligent & Personnalisé"
    },
    {
      title: "Carte interactive, météo & budget live",
      subtitle: "Tout au même endroit",
      description: "Suivez votre parcours sur la carte sombre, consultez la météo en direct et contrôlez votre budget estimé réajusté en temps réel.",
      icon: MapPin,
      color: "from-purple-500 to-pink-600",
      badge: "Navigation & Météo Live"
    },
    {
      title: "Partage QR Code & Réservation directe",
      subtitle: "Scannez & partez !",
      description: "Partagez votre séjour à vos proches en 1 seconde par QR code. Réservez vos billets d'activités et hôtels au meilleur prix.",
      icon: QrCode,
      color: "from-emerald-500 to-teal-600",
      badge: "Clonage 1 Seconde"
    }
  ];

  const current = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onClose();
      onStartPlanning();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-sm glass-panel rounded-3xl p-6 border border-slate-700/80 shadow-2xl space-y-6 text-center relative overflow-hidden">
        
        {/* Decorative Ambient Background Glow */}
        <div className={`absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-tr ${current.color} opacity-20 blur-3xl rounded-full`} />

        {/* Skip button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors px-2 py-1"
          >
            Passer le tour
          </button>
        </div>

        {/* Dynamic Icon */}
        <div className="relative z-10 flex justify-center">
          <div className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${current.color} p-0.5 shadow-xl shadow-indigo-500/20`}>
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <current.icon className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="space-y-2 relative z-10">
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-0.5 rounded-full">
            {current.badge}
          </span>
          <h2 className="text-xl font-extrabold text-white font-display tracking-tight leading-snug">
            {current.title}
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed px-2">
            {current.description}
          </p>
        </div>

        {/* Slide Indicators Dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleNext}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            {currentSlide < slides.length - 1 ? (
              <>
                <span>Suivant</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Compass className="w-4 h-4" />
                <span>C'est parti ! Découvrir l'appli</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
