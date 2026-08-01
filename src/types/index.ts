export type VibeStyle = 
  | 'balanced'
  | 'relaxed'
  | 'intense'
  | 'cultural'
  | 'gastronomic'
  | 'nature_adventure'
  | 'romantic';

export type ActivityCategory =
  | 'culture'
  | 'monument'
  | 'restaurant'
  | 'cafe'
  | 'nature'
  | 'activity'
  | 'shopping'
  | 'relax'
  | 'hotel'
  | 'transport'
  | 'viewpoint'
  | 'nightlife'
  | 'lodging';

// Export CategoryType alias for backward compatibility
export type CategoryType = ActivityCategory;

export type GPSApp = 'google_maps' | 'waze' | 'apple_maps';

export interface HotelTier {
  name: string;
  priceEstimate: string; // e.g. "55 € / nuit"
  description?: string;
}

export interface Trip {
  id?: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  vibe: VibeStyle;
  notes?: string;
  budgetGoal?: number;
  currency?: string; // 'EUR' | 'USD' | 'GBP' etc.
  status: 'planned' | 'active' | 'completed';
  createdAt: string;

  // Logistics & Transport Info (NEW)
  nearestAirport?: string; // e.g. "Genève (GVA)" or "Marseille Provence (MRS)"
  airportIata?: string; // e.g. "GVA" or "MRS"
  nearestTrainStation?: string; // e.g. "Gare d'Annecy" or "Gare de Cassis"
  recommendedTransport?: string; // e.g. "Train TGV + Location de voiture"

  // Structured Hotel Tiers (NEW)
  hotelTiers?: {
    budget?: HotelTier;
    comfort?: HotelTier;
    luxury?: HotelTier;
  };
}

export interface DayPlan {
  id?: number;
  tripId: number;
  dayNumber: number;
  date?: string;
  title: string;
  summary: string;
  themeColor?: string;
}

export interface Activity {
  id?: number;
  dayId: number;
  time: string; // "09:30"
  title: string;
  description: string;
  category: ActivityCategory;
  locationName: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  durationMinutes?: number;
  priceEstimate?: string;
  completed: boolean;
  order: number;
}

export interface Expense {
  id?: number;
  tripId: number;
  title: string;
  amount: number;
  currency: string;
  category: 'lodging' | 'hotel' | 'transport' | 'resto' | 'restaurant' | 'activity' | 'shopping' | 'other';
  date: string;
}

export interface PackingItem {
  id?: number;
  tripId: number;
  title: string;
  category: 'clothes' | 'toiletries' | 'tech' | 'documents' | 'outdoor' | 'other';
  packed: boolean;
}

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  description: string;
  weatherDescription?: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
}

export interface UserSettings {
  id?: number;
  llmProvider: 'mistral' | 'gemini' | 'openai' | 'anthropic' | 'custom';
  apiKey?: string;
  modelName?: string;
  customEndpoint?: string;
  defaultGPS: GPSApp;
  theme: 'dark' | 'light';
  affiliatePartnerId?: string; // GetYourGuide / Travelpayouts Partner ID
}

export interface LLMPlanRequest {
  destination: string;
  daysCount?: number;
  durationDays?: number;
  vibe?: VibeStyle;
  budget?: 'small' | 'medium' | 'luxury' | 'budget' | 'premium';
  travelers?: 'solo' | 'couple' | 'friends' | 'family';
  interests?: string[];
  transportMode?: string;
  customPreferences?: string;
  customNotes?: string;
}
