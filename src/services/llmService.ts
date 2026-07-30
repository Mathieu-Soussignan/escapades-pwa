import type { LLMPlanRequest, UserSettings, Activity, ActivityCategory } from '../types';

export interface GeneratedDayPlan {
  title: string;
  summary: string;
  activities: Omit<Activity, 'id' | 'dayId'>[];
}

export interface GeneratedTripPlan {
  destination: string;
  title: string;
  summary: string;
  coverImage: string;
  days: GeneratedDayPlan[];
}

/**
  Test if a provided Mistral API key is valid live
 */
export async function testMistralApiKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.mistral.ai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`
      }
    });
    return res.ok;
  } catch (err) {
    return false;
  }
}

/**
  Main Entrypoint to generate trip or day plans via mistral, gemini, openai, or offline simulator
 */
export async function generateTripWithLLM(
  req: LLMPlanRequest,
  settings: UserSettings
): Promise<GeneratedTripPlan> {
  const provider = settings.llmProvider || 'mistral';
  const apiKey = settings.apiKey?.trim() || '';

  // If no API key is provided, use the Offline Smart AI Simulator fallback
  if (!apiKey && provider !== 'custom') {
    return simulateOfflineTripGeneration(req);
  }

  const prompt = buildLLMPrompt(req);

  try {
    if (provider === 'mistral') {
      return await fetchMistralAI(prompt, settings.modelName || 'mistral-small-latest', apiKey);
    } else if (provider === 'gemini') {
      return await fetchGeminiAI(prompt, settings.modelName || 'gemini-1.5-flash', apiKey);
    } else if (provider === 'openai') {
      return await fetchOpenAI(prompt, settings.modelName || 'gpt-4o', apiKey);
    } else if (provider === 'custom' && settings.customEndpoint) {
      return await fetchCustomLLM(prompt, settings.customEndpoint, apiKey);
    } else {
      return simulateOfflineTripGeneration(req);
    }
  } catch (err) {
    console.warn('LLM API Call failed, falling back to smart offline simulator:', err);
    return simulateOfflineTripGeneration(req);
  }
}

/**
  Custom Prompt Instruction day editor (e.g. "Remplace le resto par une pizzeria")
 */
export async function customPromptEditDayWithLLM(
  destination: string,
  dayTitle: string,
  currentActivities: Activity[],
  userInstruction: string,
  settings: UserSettings
): Promise<GeneratedDayPlan> {
  const provider = settings.llmProvider || 'mistral';
  const apiKey = settings.apiKey?.trim() || '';

  if (!apiKey && provider !== 'custom') {
    return simulateDayCustomEdit(dayTitle, currentActivities, userInstruction);
  }

  const prompt = `
Tu es un guide de voyage expert et réactif.
Destination: ${destination}
Journée actuelle (${dayTitle}) avec les activités actuelles:
${JSON.stringify(currentActivities.map(a => ({ time: a.time, title: a.title, category: a.category, locationName: a.locationName, priceEstimate: a.priceEstimate })))}

Instruction personnalisée de l'utilisateur: "${userInstruction}"

Réorganise et adapte cette journée en respectant impérativement l'instruction.
Renvoie UNIQUEMENT un objet JSON valide avec cette structure exacte (sans aucun markdown \`\`\`json) :
{
  "title": "${dayTitle}",
  "summary": "Résumé mis à jour de la journée d'après l'instruction...",
  "activities": [
    {
      "time": "09:30",
      "title": "Nom court de l'activité",
      "description": "Description captivante de 1-2 phrases",
      "category": "monument" | "restaurant" | "nature" | "activity" | "shopping" | "hotel" | "transport",
      "locationName": "Nom exact du lieu pour GPS",
      "address": "Adresse approximative",
      "durationMinutes": 60,
      "priceEstimate": "15 €" ou "Gratuit"
    }
  ]
}
`;

  try {
    let rawText = '';
    if (provider === 'mistral') {
      rawText = await callOpenAICompatibleEndpoint('https://api.mistral.ai/v1/chat/completions', apiKey, settings.modelName || 'mistral-small-latest', prompt);
    } else if (provider === 'gemini') {
      rawText = await callOpenAICompatibleEndpoint('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', apiKey, settings.modelName || 'gemini-1.5-flash', prompt);
    } else if (provider === 'openai') {
      rawText = await callOpenAICompatibleEndpoint('https://api.openai.com/v1/chat/completions', apiKey, settings.modelName || 'gpt-4o', prompt);
    } else {
      return simulateDayCustomEdit(dayTitle, currentActivities, userInstruction);
    }

    const cleaned = cleanJsonResponse(rawText);
    const parsed = JSON.parse(cleaned);
    return {
      title: parsed.title || dayTitle,
      summary: parsed.summary || 'Journée ré-optimisée.',
      activities: (parsed.activities || []).map((act: any) => ({
        time: act.time || '10:00',
        title: act.title || 'Activité',
        description: act.description || '',
        category: sanitizeCategory(act.category),
        locationName: act.locationName || destination,
        address: act.address || '',
        durationMinutes: act.durationMinutes || 60,
        priceEstimate: act.priceEstimate || 'Gratuit',
        completed: false,
        order: 1
      }))
    };
  } catch (err) {
    console.error('Custom Prompt LLM edit failed:', err);
    return simulateDayCustomEdit(dayTitle, currentActivities, userInstruction);
  }
}

/**
  Quick Re-Optimizer for preset modes: "rain", "lighter", "epicurean"
 */
export async function reOptimizeDayWithLLM(
  destination: string,
  dayTitle: string,
  currentActivities: Activity[],
  mode: 'rain' | 'lighter' | 'epicurean',
  settings: UserSettings
): Promise<GeneratedDayPlan> {
  const instructionMap = {
    rain: "Il pleut des cordes ! Remplace toutes les activités extérieures (parcs, plages, balades) par des activités couvertes confortables (musées, ateliers, salons de thé, passages couverts).",
    lighter: "Le programme est trop chargé et fatigant ! Réduis le nombre d'étapes de moitié, espace les horaires et ajoute des pauses détente calmes.",
    epicurean: "Transforme cette journée en mode 100% Épicurien et Gourmand ! Ajoute des dégustations de spécialités locales, les meilleures adresses de restos et cafés typiques."
  };

  return customPromptEditDayWithLLM(
    destination,
    dayTitle,
    currentActivities,
    instructionMap[mode] || instructionMap.rain,
    settings
  );
}

/* ---------------- Helper API Call Functions ---------------- */

function sanitizeCategory(cat?: string): ActivityCategory {
  const valid: ActivityCategory[] = ['monument', 'culture', 'restaurant', 'cafe', 'nature', 'activity', 'shopping', 'hotel', 'lodging', 'transport', 'viewpoint', 'nightlife', 'relax'];
  const lower = (cat || '').toLowerCase() as ActivityCategory;
  if (valid.includes(lower)) return lower;
  if (lower.includes('resto') || lower.includes('food')) return 'restaurant';
  if (lower.includes('parc') || lower.includes('rando')) return 'nature';
  return 'activity';
}

function buildLLMPrompt(req: LLMPlanRequest): string {
  const daysCount = req.daysCount || req.durationDays || 2;
  const vibe = req.vibe || 'balanced';
  const budget = req.budget || 'medium';
  const travelers = req.travelers || 'couple';

  return `
Tu es le meilleur guide touristique au monde et un créateur d'itinéraires sur mesure.
Génère un séjour exceptionnel et réaliste pour:
- Destination: ${req.destination}
- Durée: ${daysCount} jours
- Style/Vibe: ${vibe}
- Budget: ${budget}
- Type de voyageurs: ${travelers}
${req.interests && req.interests.length > 0 ? `- Intérêts: ${req.interests.join(', ')}` : ''}
${req.customNotes ? `- Remarques: ${req.customNotes}` : ''}

Consignes impératives :
1. Propose des lieux réels, précis avec leurs vraies adresses approximatives.
2. Pour chaque jour, inclus 3 à 5 étapes chronologiques bien espacées (matin, midi, après-midi, soir).
3. Estime un prix réaliste pour chaque étape (ex: "28 €", "7 €", "Gratuit").
4. Renvoie STRICTEMENT un JSON valide au format exact suivant sans aucun texte autour :

{
  "destination": "${req.destination}",
  "title": "Titre évocateur et attrayant de l'escapade",
  "summary": "Court résumé inspirant du séjour",
  "coverImage": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
  "days": [
    {
      "title": "Jour 1: Intitulé du jour",
      "summary": "Résumé de la journée...",
      "activities": [
        {
          "time": "09:30",
          "title": "Nom de l'étape",
          "description": "Description détaillée de 2 phrases",
          "category": "monument" | "restaurant" | "nature" | "activity" | "shopping" | "hotel" | "transport",
          "locationName": "Nom exact du lieu",
          "address": "Adresse ou quartier",
          "durationMinutes": 60,
          "priceEstimate": "15 €"
        }
      ]
    }
  ]
}
`;
}

async function callOpenAICompatibleEndpoint(
  url: string,
  apiKey: string,
  model: string,
  prompt: string
): Promise<string> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: 'Tu es un générateur d\'itinéraires de voyage qui répond uniquement en JSON strict.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

async function fetchMistralAI(prompt: string, model: string, apiKey: string): Promise<GeneratedTripPlan> {
  const text = await callOpenAICompatibleEndpoint('https://api.mistral.ai/v1/chat/completions', apiKey, model, prompt);
  return parseTripPlanJSON(text);
}

async function fetchGeminiAI(prompt: string, model: string, apiKey: string): Promise<GeneratedTripPlan> {
  const text = await callOpenAICompatibleEndpoint('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', apiKey, model, prompt);
  return parseTripPlanJSON(text);
}

async function fetchOpenAI(prompt: string, model: string, apiKey: string): Promise<GeneratedTripPlan> {
  const text = await callOpenAICompatibleEndpoint('https://api.openai.com/v1/chat/completions', apiKey, model, prompt);
  return parseTripPlanJSON(text);
}

async function fetchCustomLLM(prompt: string, endpoint: string, apiKey: string): Promise<GeneratedTripPlan> {
  const text = await callOpenAICompatibleEndpoint(endpoint, apiKey || 'dummy', 'local-model', prompt);
  return parseTripPlanJSON(text);
}

function cleanJsonResponse(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
  }
  return cleaned.trim();
}

function parseTripPlanJSON(raw: string): GeneratedTripPlan {
  const cleaned = cleanJsonResponse(raw);
  const parsed = JSON.parse(cleaned);
  
  return {
    destination: parsed.destination || 'Destination',
    title: parsed.title || 'Escapade sur mesure',
    summary: parsed.summary || 'Un super séjour préparé pour vous.',
    coverImage: parsed.coverImage || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop',
    days: (parsed.days || []).map((d: any, idx: number) => ({
      title: d.title || `Jour ${idx + 1}`,
      summary: d.summary || '',
      activities: (d.activities || []).map((a: any) => ({
        time: a.time || '10:00',
        title: a.title || 'Étape',
        description: a.description || '',
        category: sanitizeCategory(a.category),
        locationName: a.locationName || 'Lieu',
        address: a.address || '',
        durationMinutes: a.durationMinutes || 60,
        priceEstimate: a.priceEstimate || 'Gratuit',
        completed: false,
        order: 1
      }))
    }))
  };
}

/* ---------------- Smart Offline Simulator Fallback ---------------- */

function simulateOfflineTripGeneration(req: LLMPlanRequest): GeneratedTripPlan {
  const daysCount = req.daysCount || req.durationDays || 2;
  const dest = req.destination || 'Annecy';

  const sampleDays: GeneratedDayPlan[] = [];

  for (let i = 1; i <= daysCount; i++) {
    sampleDays.push({
      title: `Jour ${i}: Exploration & Incontournables de ${dest}`,
      summary: `Une journée équilibrée combinant visites culturelles, gastronomie locale et moments de détente.`,
      activities: [
        {
          time: "09:30",
          title: `Petit-déjeuner & Café au cœur de ${dest}`,
          description: `Démarrage de la journée avec un expresso en terrasse et viennoiseries artisanales.`,
          category: "restaurant",
          locationName: `Centre Historique de ${dest}`,
          address: `Quai principal, ${dest}`,
          durationMinutes: 45,
          priceEstimate: "12 €",
          completed: false,
          order: 1
        },
        {
          time: "11:00",
          title: `Visite du Monument & Musée Majeur`,
          description: `Découverte du patrimoine et des secrets d'histoire de la ville.`,
          category: "monument",
          locationName: `Musée Principal de ${dest}`,
          address: `Place du Château, ${dest}`,
          durationMinutes: 90,
          priceEstimate: "8 €",
          completed: false,
          order: 2
        },
        {
          time: "13:00",
          title: `Déjeuner Gastronomique Régional`,
          description: `Dégustation de spécialités et produits locaux de saison.`,
          category: "restaurant",
          locationName: `Restaurant Le Terroir, ${dest}`,
          address: `Rue de la Paix, ${dest}`,
          durationMinutes: 75,
          priceEstimate: "28 €",
          completed: false,
          order: 3
        },
        {
          time: "15:30",
          title: `Balade Nature & Point de Vue Panoramique`,
          description: `Promenade relaxante pour capturer de superbes photos de la destination.`,
          category: "nature",
          locationName: `Parc Panoramique de ${dest}`,
          address: `Belvédère, ${dest}`,
          durationMinutes: 90,
          priceEstimate: "Gratuit",
          completed: false,
          order: 4
        }
      ]
    });
  }

  return {
    destination: dest,
    title: `Échappée Belle à ${dest}`,
    summary: `Un itinéraire sur mesure de ${daysCount} jours conçu pour une expérience inoubliable à ${dest}.`,
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
    days: sampleDays
  };
}

function simulateDayCustomEdit(dayTitle: string, currentActivities: Activity[], instruction: string): GeneratedDayPlan {
  const updatedActs = currentActivities.map(a => ({
    time: a.time,
    title: a.title,
    description: a.description,
    category: a.category,
    locationName: a.locationName,
    address: a.address,
    durationMinutes: a.durationMinutes,
    priceEstimate: a.priceEstimate,
    completed: false,
    order: a.order
  }));

  if (instruction.toLowerCase().includes('pizzeria') || instruction.toLowerCase().includes('pizza')) {
    const restoIdx = updatedActs.findIndex(a => a.category === 'restaurant');
    if (restoIdx !== -1) {
      updatedActs[restoIdx].title = "Déjeuner en Pizzeria Italienne Artisanal";
      updatedActs[restoIdx].description = "Pizzas au four à bois et spécialités de pâtes fraîches.";
      updatedActs[restoIdx].priceEstimate = "18 €";
    }
  }

  return {
    title: dayTitle,
    summary: `Journée ajustée : "${instruction}"`,
    activities: updatedActs
  };
}
