export type CategoryType = 'monument' | 'restaurant' | 'nature' | 'transport' | 'hotel' | 'activity' | 'viewpoint' | 'shopping' | 'nightlife';

export type TripStatus = 'planned' | 'active' | 'completed' | 'draft';

export type VibeStyle = 'balanced' | 'relaxed' | 'intense' | 'cultural' | 'gastronomic' | 'nature_adventure' | 'romantic';

export type GPSApp = 'google_maps' | 'waze' | 'apple_maps';

export interface Activity {
  id?: number;
  dayId: number;
  time: string; // "09:30"
  title: string;
  description: string;
  category: CategoryType;
  locationName: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  durationMinutes?: number;
  priceEstimate?: string;
  completed: boolean;
  notes?: string;
  order: number;
}

export interface DayPlan {
  id?: number;
  tripId: number;
  dayNumber: number;
  date?: string; // YYYY-MM-DD
  title: string;
  summary: string;
  themeColor?: string;
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
  currency?: string;
  status: TripStatus;
  createdAt: string;
}

export interface Expense {
  id?: number;
  tripId: number;
  activityId?: number;
  title: string;
  amount: number;
  currency: string;
  category: 'resto' | 'transport' | 'hotel' | 'activity' | 'shopping' | 'other';
  date: string;
}

export interface PackingItem {
  id?: number;
  tripId: number;
  title: string;
  category: 'documents' | 'clothes' | 'tech' | 'toiletries' | 'outdoor' | 'other';
  packed: boolean;
}

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  weatherDescription: string;
  rainProbability?: number;
  icon: string;
}

export interface UserSettings {
  id?: number;
  llmProvider: 'mistral' | 'gemini' | 'openai' | 'anthropic' | 'custom';
  apiKey: string;
  customEndpoint?: string;
  modelName: string;
  defaultGPS: GPSApp;
  theme: 'dark' | 'light' | 'system';
  offlineNoticeDismissed?: boolean;
}

export interface LLMPlanRequest {
  destination: string;
  durationDays: number;
  vibe: VibeStyle;
  interests: string[];
  budget: 'budget' | 'medium' | 'premium';
  transportMode: 'car' | 'transit' | 'walking';
  customNotes?: string;
}
