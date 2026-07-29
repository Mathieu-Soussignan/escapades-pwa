import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { Trip, Expense } from '../../types';
import { formatPrice } from '../../utils/costUtils';
import { Wallet, Plus, Trash2, PieChart, DollarSign, Utensils, Car, Compass, ShoppingBag, Bed, HelpCircle } from 'lucide-react';

interface BudgetTrackerProps {
  trip: Trip;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({ trip }) => {
  const expenses = useLiveQuery(
    () => (trip.id ? db.expenses.where('tripId').equals(trip.id).toArray() : []),
    [trip.id]
  );

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('resto');

  const totalSpent = expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const budgetGoal = trip.budgetGoal || 500;
  const spentPercent = Math.min(100, Math.round((totalSpent / budgetGoal) * 100));

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !trip.id) return;

    await db.expenses.add({
      tripId: trip.id,
      title,
      amount: parseFloat(amount),
      currency: trip.currency || 'EUR',
      category,
      date: new Date().toISOString().split('T')[0]
    });

    setTitle('');
    setAmount('');
    setShowAddExpense(false);
  };

  const handleDeleteExpense = async (id: number) => {
    await db.expenses.delete(id);
  };

  const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    resto: Utensils,
    restaurant: Utensils,
    transport: Car,
    activity: Compass,
    shopping: ShoppingBag,
    lodging: Bed,
    hotel: Bed,
    other: HelpCircle
  };

  return (
    <div className="glass-panel rounded-3xl p-4 border border-slate-800 space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-slate-100 text-xs font-display">Budget & Dépenses Réelles</h3>
        </div>

        <button
          onClick={() => setShowAddExpense(!showAddExpense)}
          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl hover:bg-emerald-500/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Ajouter dépense
        </button>
      </div>

      {/* Budget Progress Bar */}
      <div className="space-y-1 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between text-[11px] font-semibold">
          <span className="text-slate-400">Dépensé : <strong className="text-emerald-400">{formatPrice(totalSpent, trip.currency)}</strong></span>
          <span className="text-slate-400">Objectif : <strong className="text-slate-200">{formatPrice(budgetGoal, trip.currency)}</strong></span>
        </div>

        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800 mt-1">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              spentPercent > 90 ? 'bg-rose-500' : spentPercent > 75 ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            style={{ width: `${spentPercent}%` }}
          />
        </div>
      </div>

      {/* Add Expense Form */}
      {showAddExpense && (
        <form onSubmit={handleAddExpense} className="p-3 bg-slate-900 rounded-2xl border border-slate-700 space-y-2 animate-fadeIn">
          <div>
            <label className="block text-slate-400 text-[10px] mb-1">Intitulé</label>
            <input
              type="text"
              placeholder="Ex: Resto, Essence, Souvenirs..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-100 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 text-[10px] mb-1">Montant ({trip.currency || '€'})</label>
              <input
                type="number"
                step="0.01"
                placeholder="45.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-100 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-[10px] mb-1">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-100 text-xs"
              >
                <option value="resto">Restaurant / Bar</option>
                <option value="transport">Transport / Essence</option>
                <option value="activity">Activité / Visite</option>
                <option value="shopping">Shopping</option>
                <option value="lodging">Hébergement</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-1.5 rounded-xl bg-emerald-600 text-slate-950 font-bold text-xs shadow-md mt-1"
          >
            Enregistrer la dépense
          </button>
        </form>
      )}

      {/* Expenses List */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
        {expenses && expenses.length > 0 ? (
          expenses.map((exp) => {
            const Icon = categoryIcons[exp.category] || HelpCircle;
            return (
              <div
                key={exp.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px]"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-slate-800 text-slate-300">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">{exp.title}</div>
                    <div className="text-[9px] text-slate-400">{exp.date}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-emerald-400">
                    {formatPrice(exp.amount, exp.currency)}
                  </span>
                  <button
                    onClick={() => exp.id && handleDeleteExpense(exp.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-[11px] text-slate-500 py-2">
            Aucune dépense réelle enregistrée.
          </p>
        )}
      </div>
    </div>
  );
};
