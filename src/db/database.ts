import Dexie, { Table } from 'dexie';
import type { Trip, DayPlan, Activity, UserSettings, Expense, PackingItem } from '../types';

export class EscapadesDatabase extends Dexie {
  trips!: Table<Trip>;
  days!: Table<DayPlan>;
  activities!: Table<Activity>;
  settings!: Table<UserSettings>;
  expenses!: Table<Expense>;
  packingItems!: Table<PackingItem>;

  constructor() {
    super('EscapadesDB');
    
    this.version(1).stores({
      trips: '++id, destination, status, startDate',
      days: '++id, tripId, dayNumber',
      activities: '++id, dayId, time, category, completed, order',
      settings: '++id'
    });

    this.version(2).stores({
      trips: '++id, destination, status, startDate',
      days: '++id, tripId, dayNumber',
      activities: '++id, dayId, time, category, completed, order',
      settings: '++id',
      expenses: '++id, tripId, category, date',
      packingItems: '++id, tripId, category, packed'
    });
  }
}

export const db = new EscapadesDatabase();

export async function initSeedData() {
  const tripCount = await db.trips.count();
  const settingsCount = await db.settings.count();

  // Read environment variables if available
  const envMistralKey = import.meta.env.VITE_MISTRAL_API_KEY || '';
  const envGeminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const envProvider = (import.meta.env.VITE_DEFAULT_LLM_PROVIDER as any) || (envMistralKey ? 'mistral' : envGeminiKey ? 'gemini' : 'mistral');
  const envApiKey = envProvider === 'gemini' ? envGeminiKey : envMistralKey;

  if (settingsCount === 0) {
    await db.settings.add({
      llmProvider: envProvider,
      apiKey: envApiKey,
      modelName: envProvider === 'gemini' ? 'gemini-1.5-flash' : 'mistral-small-latest',
      defaultGPS: 'google_maps',
      theme: 'dark'
    });
  } else if (envApiKey) {
    const firstSetting = await db.settings.toCollection().first();
    if (firstSetting && (!firstSetting.apiKey || firstSetting.apiKey.trim() === '')) {
      await db.settings.update(firstSetting.id!, {
        llmProvider: envProvider,
        apiKey: envApiKey,
        modelName: envProvider === 'gemini' ? 'gemini-1.5-flash' : 'mistral-small-latest'
      });
    }
  }

  if (tripCount > 0) return;

  // Initial Trip 1: Escapade au Lac d'Annecy
  const trip1Id = await db.trips.add({
    title: "Escapade au Lac d'Annecy",
    destination: "Annecy, France",
    startDate: "2026-08-14",
    endDate: "2026-08-16",
    coverImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop",
    vibe: "nature_adventure",
    notes: "Week-end détente entre lac, vieille ville et balade en vélo autour du lac.",
    budgetGoal: 350,
    currency: "EUR",
    status: "active",
    createdAt: new Date().toISOString()
  });

  const day1Id = await db.days.add({
    tripId: trip1Id as number,
    dayNumber: 1,
    date: "2026-08-14",
    title: "Jour 1: Arrivée & Vieille Ville d'Annecy",
    summary: "Flânerie au bord des canaux, découverte du Palais de l'Isle et dîner savoyard.",
    themeColor: "#0A84FF"
  });

  const day2Id = await db.days.add({
    tripId: trip1Id as number,
    dayNumber: 2,
    date: "2026-08-15",
    title: "Jour 2: Tour du Lac à Vélo & Coucher de Soleil",
    summary: "Grand tour du lac (40km voie verte), pause baignade à Talloires et apéro panorama.",
    themeColor: "#30D158"
  });

  // Seed Expenses
  await db.expenses.bulkAdd([
    { tripId: trip1Id as number, title: "Location de Vélos", amount: 45, currency: "EUR", category: "transport", date: "2026-08-15" },
    { tripId: trip1Id as number, title: "Fondue Savoyarde Chez Mamie Lise", amount: 62, currency: "EUR", category: "resto", date: "2026-08-14" },
    { tripId: trip1Id as number, title: "Billets Palais de l'Isle", amount: 8, currency: "EUR", category: "monument" as any, date: "2026-08-14" }
  ]);

  // Seed Packing Items
  await db.packingItems.bulkAdd([
    { tripId: trip1Id as number, title: "Maillot de bain", category: "clothes", packed: true },
    { tripId: trip1Id as number, title: "Lunettes de soleil & Crème solaire", category: "outdoor", packed: true },
    { tripId: trip1Id as number, title: "Gourde isotherme", category: "outdoor", packed: false },
    { tripId: trip1Id as number, title: "Batterie externe / Chargeur", category: "tech", packed: false },
    { tripId: trip1Id as number, title: "Passeport / Carte d'identité", category: "documents", packed: true }
  ]);

  // Activities for Day 1
  await db.activities.bulkAdd([
    {
      dayId: day1Id as number,
      time: "10:30",
      title: "Arrivée à la Gare & Café du Pont",
      description: "Installation, dépose des bagages et premier expresso terrasse face aux canaux.",
      category: "hotel",
      locationName: "Pont des Amours, Annecy",
      address: "Quai Jules Philippe, 74000 Annecy",
      latitude: 45.9003,
      longitude: 6.1306,
      durationMinutes: 45,
      completed: true,
      order: 1
    },
    {
      dayId: day1Id as number,
      time: "11:30",
      title: "Promenade au Palais de l'Isle",
      description: "Visite de l'ancienne prison sur l'eau et ruelles médiévales de la vieille ville.",
      category: "monument",
      locationName: "Palais de l'Isle",
      address: "3 Passage de l'Isle, 74000 Annecy",
      latitude: 45.8986,
      longitude: 6.1278,
      durationMinutes: 90,
      priceEstimate: "4 €",
      completed: true,
      order: 2
    },
    {
      dayId: day1Id as number,
      time: "13:00",
      title: "Déjeuner Savoyard chez Chez Mamie Lise",
      description: "Fondue savoyarde traditionnelle ou tartiflette croustillante au reblochon.",
      category: "restaurant",
      locationName: "Chez Mamie Lise",
      address: "11 Rue Grenette, 74000 Annecy",
      latitude: 45.8992,
      longitude: 6.1265,
      durationMinutes: 75,
      priceEstimate: "28 €",
      completed: false,
      order: 3
    },
    {
      dayId: day1Id as number,
      time: "15:30",
      title: "Balade en Pédalo ou Pinteau sur le Lac",
      description: "Location d'un petit bateau à moteur sans permis aux Jardins de l'Europe.",
      category: "activity",
      locationName: "Jardins de l'Europe",
      address: "Quai Napoléon III, 74000 Annecy",
      latitude: 45.8979,
      longitude: 6.1322,
      durationMinutes: 120,
      priceEstimate: "35 € / heure",
      completed: false,
      order: 4
    },
    {
      dayId: day1Id as number,
      time: "19:30",
      title: "Coucher de Soleil & Dîner au Clos des Sens",
      description: "Vue imprenable sur le lac et gastronomie raffinée.",
      category: "restaurant",
      locationName: "Le Clos des Sens",
      address: "13 Rue Jean Mermoz, 74940 Annecy",
      latitude: 45.9145,
      longitude: 6.1481,
      durationMinutes: 120,
      completed: false,
      order: 5
    }
  ]);

  // Activities for Day 2
  await db.activities.bulkAdd([
    {
      dayId: day2Id as number,
      time: "09:00",
      title: "Location de Vélos Électriques Roul'Ma Poule",
      description: "Prise en main des vélos pour démarrer la voie verte du lac.",
      category: "transport",
      locationName: "Roul'Ma Poule Annecy",
      address: "4 Rue du Paquier, 74000 Annecy",
      latitude: 45.9012,
      longitude: 6.1290,
      durationMinutes: 30,
      completed: false,
      order: 1
    },
    {
      dayId: day2Id as number,
      time: "11:30",
      title: "Baignade & Pause Glace à Talloires",
      description: "Haltes sur la baie de Talloires, eau turquoise et cadre majestueux.",
      category: "nature",
      locationName: "Baie de Talloires",
      address: "Plage de Talloires, 74290 Talloires-Montmin",
      latitude: 45.8361,
      longitude: 6.2127,
      durationMinutes: 90,
      completed: false,
      order: 2
    }
  ]);

  // Initial Trip 2: Week-end à Kyoto
  const trip2Id = await db.trips.add({
    title: "Merveilles de Kyoto & Arashiyama",
    destination: "Kyoto, Japon",
    startDate: "2026-10-10",
    endDate: "2026-10-14",
    coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop",
    vibe: "cultural",
    notes: "Voyage contemplatif au moment du feuillage des érables (Momiji).",
    budgetGoal: 1500,
    currency: "EUR",
    status: "planned",
    createdAt: new Date().toISOString()
  });

  const dayKyoto1Id = await db.days.add({
    tripId: trip2Id as number,
    dayNumber: 1,
    date: "2026-10-10",
    title: "Jour 1: Bambouseraie d'Arashiyama & Temples Zen",
    summary: "Lever de soleil dans les bambous, pont Togetsukyo et repas Matcha.",
    themeColor: "#BF5AF2"
  });

  await db.activities.add({
    dayId: dayKyoto1Id as number,
    time: "07:30",
    title: "Arashiyama Bamboo Grove au calme",
    description: "Visite très tôt le matin pour éviter la foule et savourer le bruit du vent.",
    category: "nature",
    locationName: "Arashiyama Bamboo Grove",
    address: "Sagatenryuji Susukinobabacho, Ukyo Ward, Kyoto",
    latitude: 35.0169,
    longitude: 135.6713,
    durationMinutes: 90,
    completed: false,
    order: 1
  });
}
