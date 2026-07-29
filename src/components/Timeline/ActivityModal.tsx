import React, { useState, useEffect } from 'react';
import { Activity, CategoryType } from '../../types';
import { X, Clock, MapPin, AlignLeft, Tag, DollarSign } from 'lucide-react';
import { categoryConfig } from './CategoryBadge';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activityData: Partial<Activity>) => void;
  dayId: number;
  initialActivity?: Activity | null;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  dayId,
  initialActivity
}) => {
  const [time, setTime] = useState('10:00');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryType>('activity');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [priceEstimate, setPriceEstimate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);

  useEffect(() => {
    if (initialActivity) {
      setTime(initialActivity.time || '10:00');
      setTitle(initialActivity.title || '');
      setDescription(initialActivity.description || '');
      setCategory(initialActivity.category || 'activity');
      setLocationName(initialActivity.locationName || '');
      setAddress(initialActivity.address || '');
      setPriceEstimate(initialActivity.priceEstimate || '');
      setDurationMinutes(initialActivity.durationMinutes || 60);
    } else {
      setTime('10:00');
      setTitle('');
      setDescription('');
      setCategory('activity');
      setLocationName('');
      setAddress('');
      setPriceEstimate('');
      setDurationMinutes(60);
    }
  }, [initialActivity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !locationName.trim()) return;

    onSave({
      ...(initialActivity ? { id: initialActivity.id } : {}),
      dayId,
      time,
      title: title.trim(),
      description: description.trim(),
      category,
      locationName: locationName.trim(),
      address: address.trim() || undefined,
      priceEstimate: priceEstimate.trim() || undefined,
      durationMinutes: Number(durationMinutes) || 60,
      completed: initialActivity ? initialActivity.completed : false,
      order: initialActivity ? initialActivity.order : 99
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-t-3xl sm:rounded-3xl p-5 border border-slate-700/80 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 font-display">
            {initialActivity ? 'Modifier l’activité' : 'Ajouter une étape'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Time & Duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" /> Heure
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Durée (min)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                min="15"
                step="15"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">
              Titre de l'étape *
            </label>
            <input
              type="text"
              placeholder="Ex: Visite guidée du Palais..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-purple-400" /> Catégorie
            </label>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {(Object.keys(categoryConfig) as CategoryType[]).map((cat) => {
                const conf = categoryConfig[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl border text-[11px] font-medium transition-all ${
                      isSelected
                        ? `${conf.bg} ${conf.color} ${conf.border} font-bold ring-1 ring-blue-400`
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {React.createElement(conf.icon, { className: 'w-3.5 h-3.5 shrink-0' })}
                    <span className="truncate">{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location & Address */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" /> Lieu / Point d'intérêt *
            </label>
            <input
              type="text"
              placeholder="Ex: Palais de l'Isle"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Adresse exacte (optionnel)
              </label>
              <input
                type="text"
                placeholder="Rue, ville..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Prix estimé
              </label>
              <input
                type="text"
                placeholder="Ex: 15 € / gratuit"
                value={priceEstimate}
                onChange={(e) => setPriceEstimate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5 text-indigo-400" /> Notes & Détails
            </label>
            <textarea
              rows={3}
              placeholder="Conseils, numéro de réservation, choses à voir..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500"
            >
              {initialActivity ? 'Enregistrer' : 'Ajouter'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
