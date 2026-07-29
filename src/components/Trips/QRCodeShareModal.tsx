import React, { useState } from 'react';
import type { Trip, DayPlan, Activity } from '../../types';
import { QrCode, Copy, Check, X, Smartphone, Sparkles } from 'lucide-react';

interface QRCodeShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  days: DayPlan[];
  activities: Activity[];
}

export const QRCodeShareModal: React.FC<QRCodeShareModalProps> = ({
  isOpen,
  onClose,
  trip,
  days,
  activities
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Create lightweight compact payload for QR Code URL
  const exportPayload = {
    t: { title: trip.title, destination: trip.destination, vibe: trip.vibe, coverImage: trip.coverImage },
    d: days.map(d => ({ dayNumber: d.dayNumber, title: d.title, summary: d.summary })),
    a: activities.map(a => ({
      time: a.time,
      title: a.title,
      description: a.description,
      category: a.category,
      locationName: a.locationName,
      address: a.address,
      durationMinutes: a.durationMinutes,
      priceEstimate: a.priceEstimate
    }))
  };

  const jsonStr = JSON.stringify(exportPayload);
  // Base64 encode for clean URL parameter
  const base64Data = btoa(unescape(encodeURIComponent(jsonStr)));
  const shareableUrl = `${window.location.origin}${window.location.pathname}?importTrip=${encodeURIComponent(base64Data)}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(shareableUrl)}&color=ffffff&bgcolor=090d16`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm glass-panel rounded-3xl p-5 border border-slate-700/80 shadow-2xl space-y-4 text-center">
        
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5 font-bold text-slate-100 text-sm font-display">
            <QrCode className="w-4 h-4 text-purple-400" />
            <span>Partager par QR Code</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="font-extrabold text-base text-white">{trip.title}</h3>
          <p className="text-xs text-slate-400">Scannez pour cloner cette escapade en 1 seconde !</p>
        </div>

        {/* QR Code Canvas Container */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-purple-500/30 inline-block shadow-inner">
          <img
            src={qrImageUrl}
            alt="QR Code d'Escapade"
            className="w-48 h-48 mx-auto rounded-xl"
          />
        </div>

        <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
          <Smartphone className="w-3.5 h-3.5 text-blue-400" />
          Ouvrez l'appareil photo d'un iPhone ou Android pour scanner
        </div>

        {/* Copy Link Alternative */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={handleCopyLink}
            className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Lien copié dans le presse-papier !
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-purple-400" />
                Copier le lien d'importation
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
