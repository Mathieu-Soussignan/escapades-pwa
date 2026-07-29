import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { Expense, Trip } from '../../types';
import { Plus, DollarSign, PieChart, ShoppingBag, Utensils, Bus, Hotel, Ticket, Trash2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BudgetTrackerProps {
  trip: Trip;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({ trip }) => {
  const { showToast } = useApp();
  const expenses = useLiveQuery(
    () => (trip.id ? db.expenses.where('tripId').equals(trip.id).toArray() : []),
    [trip.id]
  );

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('resto');
  const currency = trip.currency || 'EUR';

  const currencySymbol = currency === 'USD' ? '$' : currency === 'JPY' ? '¥' : currency === 'GBP' ? '£' : '€';

  const totalSpent = expenses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  const budgetGoal = trip.budgetGoal || 500;
  const remainingBudget = budgetGoal - totalSpent;
  const percentSpent = Math.min(100, Math.round((totalSpent / budgetGoal) * 100));

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !trip.id) return;

    await db.expenses.add({
      tripId: trip.id,
      title: title.trim(),
      amount: Number(amount),
      currency,
      category,
      date: new Date().toISOString().split('T')[0]
    });

    setTitle('');
    setAmount('');
    setShowAddModal(false);
    showToast('Dépense ajoutée !');
  };

  const handleDeleteExpense = async (id: number) => {
    await db.expenses.delete(id);
    showToast('Dépense supprimée');
  };

  const categoryIcons = {
    resto: Utensils,
    transport: Bus,
    hotel: Hotel,
    activity: Ticket,
    shopping: ShoppingBag,
    other: DollarSign
  };

  return (
    <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-4 shadow-xl">
      
      {/* Header & Total Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-100 font-display flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-emerald-400" />
            Budget & Dépenses du Voyage
          </h3>
          <p className="text-xs text-slate-400">
            Objectif: {budgetGoal} {currencySymbol}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-2xl text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5" />
          Dépense
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-300">
            Dépensé: <span className="text-emerald-400 font-bold">{totalSpent} {currencySymbol}</span>
          </span>
          <span className={`text-[11px] ${remainingBudget < 0 ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
            {remainingBudget >= 0 ? `Reste ${remainingBudget} ${currencySymbol}` : `Dépassement de ${Math.abs(remainingBudget)} ${currencySymbol}`}
          </span>
        </div>
        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentSpent > 90 ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
            }`}
            style={{ width: `${percentSpent}%` }}
          />
        </div>
      </div>

      {/* Expense Items List */}
      <div className="space-y-2 pt-1">
        {expenses && expenses.length > 0 ? (
          expenses.map((exp) => {
            const Icon = categoryIcons[exp.category] || DollarSign;
            return (
              <div
                key={exp.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200">{exp.title}</h4>
                    <p className="text-[10px] text-slate-400">{exp.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400 font-mono">
                    -{exp.amount} {currencySymbol}
                  </span>
                  <button
                    onClick={() => exp.id && handleDeleteExpense(exp.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-xs text-slate-500 py-3">Aucune dépense enregistrée.</p>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm glass-panel rounded-3xl p-5 border border-slate-700 shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="font-bold text-slate-100 font-display">Ajouter une dépense</h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Titre *</label>
                <input
                  type="text"
                  placeholder="Ex: Resto Savoyard, Billet de train..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Montant ({currencySymbol}) *</label>
                <input
                  type="number"
                  placeholder="35"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Catégorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                >
                  <option value="resto">🍽️ Resto & Bar</option>
                  <option value="transport">🚗 Transport</option>
                  <option value="hotel">🏨 Hébergement</option>
                  <option value="activity">🎟️ Activité & Visites</option>
                  <option value="shopping">🛍️ Shopping</option>
                  <option value="other">💵 Autre</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-400"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold shadow-lg"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
