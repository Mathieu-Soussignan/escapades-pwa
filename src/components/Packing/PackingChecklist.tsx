import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { PackingItem, Trip } from '../../types';
import { Plus, Check, Luggage, ShieldCheck, Laptop, Shirt, Sparkles, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PackingChecklistProps {
  trip: Trip;
}

export const PackingChecklist: React.FC<PackingChecklistProps> = ({ trip }) => {
  const { showToast } = useApp();
  const items = useLiveQuery(
    () => (trip.id ? db.packingItems.where('tripId').equals(trip.id).toArray() : []),
    [trip.id]
  );

  const [newItemTitle, setNewItemTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PackingItem['category']>('clothes');

  const totalItems = items?.length || 0;
  const packedCount = items?.filter(i => i.packed).length || 0;
  const progressPercent = totalItems > 0 ? Math.round((packedCount / totalItems) * 100) : 0;

  const handleTogglePacked = async (id: number, currentPacked: boolean) => {
    await db.packingItems.update(id, { packed: !currentPacked });
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !trip.id) return;

    await db.packingItems.add({
      tripId: trip.id,
      title: newItemTitle.trim(),
      category: selectedCategory,
      packed: false
    });

    setNewItemTitle('');
    showToast('Élément ajouté à la valise !');
  };

  const handleDeleteItem = async (id: number) => {
    await db.packingItems.delete(id);
  };

  return (
    <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-4 shadow-xl">
      
      {/* Header Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-100 font-display flex items-center gap-1.5">
            <Luggage className="w-4 h-4 text-purple-400" />
            Check-list Valise & Sac
          </h3>
          <p className="text-xs text-slate-400">
            {packedCount} / {totalItems} objets prêts ({progressPercent}%)
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
        <div
          className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Fast Add Form */}
      <form onSubmit={handleAddItem} className="flex gap-2">
        <input
          type="text"
          placeholder="Ajouter à la valise (ex: Chargeur, Gourde...)"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as any)}
          className="bg-slate-900 border border-slate-700/80 rounded-xl px-2 py-2 text-xs text-slate-300 focus:outline-none"
        >
          <option value="clothes">👕 Vêtements</option>
          <option value="documents">📄 Papier/Pass</option>
          <option value="tech">🔌 Électronique</option>
          <option value="outdoor">🎒 Outdoor</option>
          <option value="toiletries">🧴 Hygiène</option>
        </select>
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-2 rounded-xl text-xs"
        >
          +
        </button>
      </form>

      {/* Checklist List */}
      <div className="space-y-1.5 pt-1">
        {items && items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => item.id && handleTogglePacked(item.id, item.packed)}
              className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                item.packed
                  ? 'bg-slate-900/40 border-slate-800 text-slate-500 line-through'
                  : 'bg-slate-900/80 border-slate-700/60 text-slate-200 hover:border-purple-500/40'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    item.packed
                      ? 'bg-purple-500 border-purple-500 text-slate-950'
                      : 'border-slate-600 bg-slate-950'
                  }`}
                >
                  {item.packed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className="font-medium">{item.title}</span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  item.id && handleDeleteItem(item.id);
                }}
                className="text-slate-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-xs text-slate-500 py-3">Valise vide.</p>
        )}
      </div>

    </div>
  );
};
