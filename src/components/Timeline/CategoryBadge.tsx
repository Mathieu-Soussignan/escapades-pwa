import React from 'react';
import { CategoryType } from '../../types';
import { 
  Landmark, 
  Utensils, 
  Trees, 
  Bus, 
  Hotel, 
  Ticket, 
  Eye, 
  ShoppingBag, 
  Moon 
} from 'lucide-react';

interface CategoryBadgeProps {
  category: CategoryType;
  size?: 'sm' | 'md';
}

export const categoryConfig: Record<CategoryType, { label: string; color: string; bg: string; border: string; icon: React.ComponentType<{ className?: string }> }> = {
  monument: {
    label: 'Monument',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: Landmark
  },
  restaurant: {
    label: 'Resto & Café',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    icon: Utensils
  },
  nature: {
    label: 'Nature',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: Trees
  },
  transport: {
    label: 'Transport',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
    icon: Bus
  },
  hotel: {
    label: 'Hébergement',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    icon: Hotel
  },
  activity: {
    label: 'Activité',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    icon: Ticket
  },
  viewpoint: {
    label: 'Panorama',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: Eye
  },
  shopping: {
    label: 'Shopping',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    icon: ShoppingBag
  },
  nightlife: {
    label: 'Soirée',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    icon: Moon
  }
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'md' }) => {
  const conf = categoryConfig[category] || categoryConfig.activity;
  const Icon = conf.icon;

  const sizeClasses = size === 'sm' 
    ? 'text-[10px] px-2 py-0.5 gap-1' 
    : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${conf.bg} ${conf.color} ${conf.border} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {conf.label}
    </span>
  );
};
