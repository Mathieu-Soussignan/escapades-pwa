import React, { useState, useEffect } from 'react';
import type { Activity, ActivityCategory } from '../../types';
import { categoryConfigs } from './CategoryBadge';
import { Clock, MapPin, DollarSign, Tag, FileText } from 'lucide-react';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Partial<Activity>) => void;
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
  const [category, setCategory] = useState<ActivityCategory>('activity');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [priceEstimate, setPriceEstimate] = useState('');

  useEffect(() => {
    if (initialActivity) {
      setTime(initialActivity.time || '10:00');
      setTitle(initialActivity.title || '');
      setDescription(initialActivity.description || '');
      setCategory(initialActivity.category || 'activity');
      setLocationName(initialActivity.locationName || '');
      setAddress(initialActivity.address || '');
      setDurationMinutes(initialActivity.durationMinutes || 60);
      setPriceEstimate(initialActivity.priceEstimate || '');
    } else {
      setTime('10:00');
      setTitle('');
      setDescription('');
      setCategory('activity');
      setLocationName('');
      setAddress('');
      setDurationMinutes(60);
      setPriceEstimate('');
    }
  }, [initialActivity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !locationName) return;

    onSave({
      id: initialActivity?.id,
      dayId,
      time,
      title,
      description,
      category,
      locationName,
      address,
      durationMinutes,
      priceEstimate,
      completed: initialActivity?.completed || false,
      order: initialActivity?.order || 1
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-t-3xl sm:rounded-3xl p-5 border border-slate-700/80 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-base font-bold text-slate-100 font-display">
            {initialActivity ? "Modifier l'étape" : "Ajouter une étape"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Horaire *</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Durée (min)</label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Titre de l'étape *</label>
            <input
              type="text"
              placeholder="Ex: Visite du Musée de Préhistoire..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Lieu / Destination *</label>
            <input
              type="text"
              placeholder="Ex: Palais de l'Isle, Annecy"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Catégorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ActivityCategory)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
            >
              {Object.entries(categoryConfigs).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Prix estimé</label>
            <input
              type="text"
              placeholder="Ex: 15 € ou Gratuit"
              value={priceEstimate}
              onChange={(e) => setPriceEstimate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Conseils, histoire du lieu ou détails pratiques..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-500/25"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
