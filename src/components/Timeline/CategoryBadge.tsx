import React from 'react';
import type { ActivityCategory } from '../../types';
import { 
  Landmark, 
  Utensils, 
  Trees, 
  Compass, 
  ShoppingBag, 
  Hotel, 
  Car, 
  Camera, 
  Moon,
  Coffee,
  Smile,
  Bed
} from 'lucide-react';

interface CategoryBadgeProps {
  category: ActivityCategory;
  size?: 'sm' | 'md' | 'lg';
}

export const categoryConfigs: Record<ActivityCategory, {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  monument: { label: 'Monument', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Landmark },
  culture: { label: 'Culture', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Landmark },
  restaurant: { label: 'Resto & Café', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', icon: Utensils },
  cafe: { label: 'Café', color: 'text-amber-300', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: Coffee },
  nature: { label: 'Nature & Parc', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Trees },
  activity: { label: 'Activité', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Compass },
  shopping: { label: 'Shopping', color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', icon: ShoppingBag },
  hotel: { label: 'Hôtel', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: Hotel },
  lodging: { label: 'Hébergement', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: Bed },
  transport: { label: 'Trajet', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', icon: Car },
  viewpoint: { label: 'Panorama', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', icon: Camera },
  nightlife: { label: 'Soirée', color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', icon: Moon },
  relax: { label: 'Détente', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20', icon: Smile },
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'md' }) => {
  const config = categoryConfigs[category] || categoryConfigs.activity;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2'
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${config.bg} ${config.color} ${config.border} ${sizeClasses[size]}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};
