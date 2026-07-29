import type { LLMPlanRequest, UserSettings, Activity } from '../types';

export interface GeneratedDayOutput {
  dayNumber: number;
  title: string;
  summary: string;
  activities: {
    time: string;
    title: string;
    description: string;
    category: 'monument' | 'restaurant' | 'nature' | 'transport' | 'hotel' | 'activity' | 'viewpoint' | 'shopping' | 'nightlife';
    locationName: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    durationMinutes?: number;
    priceEstimate?: string;
    completed?: boolean;
  }[];
}

export interface GeneratedTripResponse {
  title: string;
  destination: string;
  vibeSummary: string;
  coverImage: string;
  days: GeneratedDayOutput[];
}

export async function generateItineraryWithLLM(
  request: LLMPlanRequest,
  settings: UserSettings
): Promise<GeneratedTripResponse> {
  if (settings.apiKey && settings.apiKey.trim().length > 3) {
    try {
      return await callProviderAPI(request, settings);
    } catch (err) {
      console.warn('Real API call failed, falling back to smart AI simulator:', err);
    }
  }

  return simulateAIGeneration(request);
}

// -------------------------------------------------------------
// AI Magic Re-Plan / Weather Adaptor ("Il pleut !", "Trop chargé", etc.)
// -------------------------------------------------------------
export async function reOptimizeDayWithLLM(
  destination: string,
  dayTitle: string,
  currentActivities: Activity[],
  replanMode: 'rain' | 'lighter' | 'epicurean',
  settings: UserSettings
): Promise<{ title: string; summary: string; activities: GeneratedDayOutput['activities'] }> {
  if (!settings.apiKey || settings.apiKey.trim().length < 4) {
    // Offline / Demo Fallback for Re-Plan
    await new Promise((res) => setTimeout(res, 1200));

    if (replanMode === 'rain') {
      return {
        title: `${dayTitle} (Adapté Pluie 🌧️)`,
        summary: "Programme ajusté : activités en intérieur, musées, passages couverts et pause chocolat chaud.",
        activities: [
          {
            time: "10:00",
            title: "Visite du Musée National & Expositions",
            description: "Au sec ! Découverte des galeries d'art et chef-d'œuvres locaux.",
            category: "monument",
            locationName: `Musée des Beaux-Arts, ${destination}`,
            durationMinutes: 120,
            priceEstimate: "12 €",
            completed: false
          },
          {
            time: "12:30",
            title: "Déjeuner sous les arcades",
            description: "Bistrot chaleureux à l'abri des intempéries.",
            category: "restaurant",
            locationName: `Passage Couvert, ${destination}`,
            durationMinutes: 90,
            priceEstimate: "26 €",
            completed: false
          },
          {
            time: "15:00",
            title: "Salon de Thé & Pâtisserie artisanale",
            description: "Pause gourmande et chocolat chaud onctueux.",
            category: "restaurant",
            locationName: `Salon de Thé, ${destination}`,
            durationMinutes: 75,
            completed: false
          },
          {
            time: "17:30",
            title: "Séance Cinéma ou Spectacle",
            description: "Divertissement culturel au chaud.",
            category: "activity",
            locationName: `Théâtre / Cinéma, ${destination}`,
            durationMinutes: 120,
            completed: false
          }
        ]
      };
    } else {
      return {
        title: `${dayTitle} (Mode Détente 🍷)`,
        summary: "Rythme plus doux avec temps libre et sélection de lieux épicuriens.",
        activities: currentActivities.map(a => ({
          time: a.time,
          title: a.title,
          description: a.description,
          category: a.category,
          locationName: a.locationName,
          address: a.address,
          durationMinutes: a.durationMinutes,
          priceEstimate: a.priceEstimate,
          completed: a.completed
        }))
      };
    }
  }

  let promptConstraint = "";
  if (replanMode === 'rain') {
    promptConstraint = "ATTENTION IL PLEUT ! Remplace TOUTES les activités extérieures par des activités 100% en intérieur (musées, galeries couvertes, salons de thé, ateliers, dégustations).";
  } else if (replanMode === 'lighter') {
    promptConstraint = "Le planning est trop chargé ! Ne garde que 3 étapes clés aérées avec beaucoup de temps libre et de pauses.";
  } else {
    promptConstraint = "Mode Épicurien ! Ajoute une dégustation de vins/spécialités, un resto réputé et un super bar pour la soirée.";
  }

  const userPrompt = `Ré-optimise cette journée à ${destination}.
Titre actuel: ${dayTitle}
Activités actuelles: ${JSON.stringify(currentActivities.map(a => ({ time: a.time, title: a.title, loc: a.locationName })))}

Contrainte de ré-optimisation: ${promptConstraint}

Réponds EXCLUSIVEMENT avec ce JSON structuré :
{
  "title": "Nouveau titre de la journée",
  "summary": "Nouveau résumé explicatif",
  "activities": [
    {
      "time": "10:00",
      "title": "Titre activité",
      "description": "Description",
      "category": "monument",
      "locationName": "Lieu",
      "durationMinutes": 90,
      "priceEstimate": "15 €"
    }
  ]
}`;

  let endpoint = 'https://api.openai.com/v1/chat/completions';
  let modelName = settings.modelName;

  if (settings.llmProvider === 'mistral') {
    endpoint = 'https://api.mistral.ai/v1/chat/completions';
    if (!modelName) modelName = 'mistral-small-latest';
  } else if (settings.llmProvider === 'gemini') {
    endpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
    if (!modelName) modelName = 'gemini-1.5-flash';
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: 'Tu es un expert en voyages. Réponds toujours avec un JSON valide.' },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })
  });

  if (!res.ok) {
    throw new Error(`Erreur Re-Plan (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  let content = data.choices[0].message.content;
  if (content.includes('```')) {
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
  }

  return JSON.parse(content);
}

// -------------------------------------------------------------
// Universal Provider Router
// -------------------------------------------------------------
async function callProviderAPI(
  req: LLMPlanRequest,
  settings: UserSettings
): Promise<GeneratedTripResponse> {
  let endpoint = 'https://api.openai.com/v1/chat/completions';
  let modelName = settings.modelName;

  if (settings.llmProvider === 'mistral') {
    endpoint = 'https://api.mistral.ai/v1/chat/completions';
    if (!modelName) modelName = 'mistral-small-latest';
  } else if (settings.llmProvider === 'gemini') {
    endpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
    if (!modelName) modelName = 'gemini-1.5-flash';
  } else if (settings.llmProvider === 'custom') {
    endpoint = settings.customEndpoint || 'http://localhost:11434/v1/chat/completions';
  } else {
    if (!modelName) modelName = 'gpt-4o';
  }

  const systemPrompt = `Tu es un expert mondial de l'organisation de voyages et escapades sur-mesure. 
Ta mission est de générer un itinéraire structuré sous forme de JSON strict.
Pour chaque activité, fournis une catégorie parmi ['monument', 'restaurant', 'nature', 'transport', 'hotel', 'activity', 'viewpoint', 'shopping', 'nightlife'].
Donne des noms de lieux exacts et des coordonnées approximatives (latitude, longitude) quand c'est possible.`;

  const userPrompt = `Génère une escapade de ${req.durationDays} jour(s) à ${req.destination}.
Ambiance / Vibe: ${req.vibe}
Centres d'intérêt: ${req.interests.join(', ')}
Budget: ${req.budget}
Mode de transport: ${req.transportMode}
${req.customNotes ? `Notes particulières: ${req.customNotes}` : ''}

Réponds EXCLUSIVEMENT avec cet objet JSON structuré (sans aucun texte autour) :
{
  "title": "Titre inspirant de l'escapade",
  "destination": "${req.destination}",
  "vibeSummary": "Un court paragraphe qui résume l'esprit du voyage",
  "coverImage": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
  "days": [
    {
      "dayNumber": 1,
      "title": "Jour 1: Titre du jour",
      "summary": "Résumé de la journée",
      "activities": [
        {
          "time": "09:30",
          "title": "Titre activité",
          "description": "Description détaillée",
          "category": "monument",
          "locationName": "Nom du lieu",
          "address": "Adresse approximative",
          "latitude": 48.8566,
          "longitude": 2.3522,
          "durationMinutes": 90,
          "priceEstimate": "15 €"
        }
      ]
    }
  ]
}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erreur API ${settings.llmProvider.toUpperCase()} (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  let content = data.choices[0].message.content;

  if (content.includes('```')) {
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();
  }

  return JSON.parse(content);
}

// -------------------------------------------------------------
// Offline AI Simulator
// -------------------------------------------------------------
async function simulateAIGeneration(req: LLMPlanRequest): Promise<GeneratedTripResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1800));

  const destLower = req.destination.toLowerCase();
  
  let coverImage = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop";
  if (destLower.includes('paris')) coverImage = "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop";
  else if (destLower.includes('rome')) coverImage = "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1000&auto=format&fit=crop";
  else if (destLower.includes('tokyo') || destLower.includes('japon')) coverImage = "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000&auto=format&fit=crop";
  else if (destLower.includes('barcelone') || destLower.includes('barcelona')) coverImage = "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=1000&auto=format&fit=crop";

  const days: GeneratedDayOutput[] = [];

  for (let i = 1; i <= req.durationDays; i++) {
    if (i === 1) {
      days.push({
        dayNumber: 1,
        title: `Jour 1: Première immersion à ${req.destination}`,
        summary: `Arrivée, découverte des ruelles emblématiques, pause gourmande et panorama.`,
        activities: [
          {
            time: "09:30",
            title: "Installation & Café de bienvenue",
            description: "Prise de possession du logement, rafraîchissement et premier expresso.",
            category: "hotel",
            locationName: `Centre ville de ${req.destination}`,
            durationMinutes: 60,
            completed: false
          },
          {
            time: "11:00",
            title: "Flânerie dans le quartier historique",
            description: "Boutiques d'artisans locaux, architecture remarquable et pépites cachées.",
            category: "monument",
            locationName: `Quartier Historique, ${req.destination}`,
            durationMinutes: 120,
            completed: false
          },
          {
            time: "13:00",
            title: "Déjeuner de spécialités locales",
            description: "Dégustation des produits de saison et plats traditionnels.",
            category: "restaurant",
            locationName: `Bistrot du Marché, ${req.destination}`,
            durationMinutes: 90,
            priceEstimate: "25 €",
            completed: false
          },
          {
            time: "15:30",
            title: "Balade & Grand Parc Botanique",
            description: "Moment de détente au calme, promenade ombragée.",
            category: "nature",
            locationName: `Jardin Public de ${req.destination}`,
            durationMinutes: 90,
            completed: false
          },
          {
            time: "19:00",
            title: "Apéro Sunset & Panorama",
            description: "Verre de vin ou cocktail sur un spot panoramique.",
            category: "viewpoint",
            locationName: `Belvédère de ${req.destination}`,
            durationMinutes: 75,
            completed: false
          }
        ]
      });
    } else {
      days.push({
        dayNumber: i,
        title: `Jour ${i}: Incontournables & Pépites locales`,
        summary: `Exploration des trésors culturels et nature.`,
        activities: [
          {
            time: "10:00",
            title: "Visite culturelle ou promenade guidée",
            description: "Découverte des chef-d'œuvres locaux.",
            category: "monument",
            locationName: `Centre Culturel de ${req.destination}`,
            durationMinutes: 120,
            priceEstimate: "14 €",
            completed: false
          },
          {
            time: "13:00",
            title: "Déjeuner Gourmand",
            description: "Recettes régionales et ambiance chaleureuse.",
            category: "restaurant",
            locationName: `Bistrot de ${req.destination}`,
            durationMinutes: 90,
            priceEstimate: "28 €",
            completed: false
          },
          {
            time: "16:00",
            title: "Dernières emplettes & Artisanat local",
            description: "Souvenirs, spécialités gourmandes et créations uniques.",
            category: "shopping",
            locationName: `Marché Artisanal de ${req.destination}`,
            durationMinutes: 90,
            completed: false
          }
        ]
      });
    }
  }

  return {
    title: `Escapade sur-mesure à ${req.destination}`,
    destination: req.destination,
    vibeSummary: `Une escapade conçue pour vivre des moments uniques.`,
    coverImage,
    days
  };
}
