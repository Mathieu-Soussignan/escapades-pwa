/**
  God Tier S++ Ultra-Intelligent & Fully Monetized Affiliate Link Generator for Escapades PWA
  
  1. ACTIVITÉS / EXCURSIONS: GetYourGuide Direct Partner ID: DHWS2LP
  2. HÔTELS & LOGEMENTS: Klook via Travelpayouts (Marker: 556489, Program p=3637)
  3. TRAINS: Klook Trains via Travelpayouts (Marker: 556489, Program p=3637)
  4. VOLS: Aviasales via Travelpayouts (Marker: 556489, Program p=100)
  5. VOITURES & SCOOTERS: GetRentacar via Travelpayouts (Marker: 556489, Program p=2567)
 */

const DEFAULT_MARKER = '556489';
const DEFAULT_GYG_PARTNER_ID = 'DHWS2LP';

const COUNTRIES_LIST = [
  'italie', 'france', 'espagne', 'portugal', 'grèce', 'grece', 
  'allemagne', 'royaume-uni', 'angleterre', 'japon', 'suisse', 
  'belgique', 'maroc', 'croatie', 'islande', 'norvège', 'suède'
];

const META_GPS_TERMS = [
  'ma position gps', 'ma position', 'mon emplacement', 
  'position gps', 'autour de moi', 'geolocalisation', 'géolocalisation', 'gps'
];

const ACTIVITY_KEYWORDS: { [key: string]: string } = {
  'kayak': 'Kayak',
  'canoe': 'Kayak',
  'canoë': 'Kayak',
  'paddle': 'Paddle',
  'bateau': 'Bateau',
  'croisiere': 'Croisière',
  'croisière': 'Croisière',
  'plongée': 'Plongée',
  'plongee': 'Plongée',
  'canyoning': 'Canyoning',
  'randonnée': 'Randonnée',
  'randonnee': 'Randonnée',
  'colisée': 'Colisée',
  'colisee': 'Colisée',
  'vatican': 'Vatican',
  'eiffel': 'Tour Eiffel',
  'louvre': 'Louvre',
  'dégustation': 'Dégustation',
  'degustation': 'Dégustation',
  'vin': 'Vin',
  'catacombes': 'Catacombes'
};

/**
  Mapping of tiny villages & natural spots to famous GetYourGuide / Klook top-level regional hubs
 */
const REGIONAL_HUB_MAP: { [key: string]: string } = {
  // Verdon & Lac de Sainte-Croix region
  'quinson': 'Gorges du Verdon',
  'verdon': 'Gorges du Verdon',
  'gorges du verdon': 'Gorges du Verdon',
  'moustiers': 'Gorges du Verdon',
  'bauduen': 'Gorges du Verdon',
  'sainte-croix': 'Gorges du Verdon',
  'riez': 'Gorges du Verdon',
  'castellane': 'Gorges du Verdon',

  // Calanques & Cassis region
  'cassis': 'Cassis Calanques',
  'calanques': 'Cassis Calanques',
  'port-miou': 'Cassis Calanques',
  'en-vau': 'Cassis Calanques',
  'sormiou': 'Calanques Marseille',
  'morgiou': 'Calanques Marseille',
  'la ciotat': 'Cassis',

  // Etang de Berre / Aix region
  'velaux': 'Aix-en-Provence',
  'rognac': 'Aix-en-Provence',
  'berre': 'Aix-en-Provence',
  'vitrolles': 'Aix-en-Provence',
  'marignane': 'Aix-en-Provence',
  'étang de berre': 'Aix-en-Provence',

  // Luberon & Camargue
  'luberon': 'Luberon',
  'gordes': 'Luberon',
  'roussillon': 'Luberon',
  'lourmarin': 'Luberon',
  'camargue': 'Camargue',
  'saintes-maries': 'Camargue',
  'arles': 'Camargue Arles'
};

/**
  Mapping of natural regions, canyons & tiny villages to their REAL major SNCF / TGV Train Hub City
 */
const TRAIN_HUB_MAP: { [key: string]: string } = {
  // Verdon & Lac de Sainte-Croix -> TGV Hub Aix-en-Provence or Marseille
  'quinson': 'Aix-en-Provence',
  'verdon': 'Aix-en-Provence',
  'gorges du verdon': 'Aix-en-Provence',
  'moustiers': 'Aix-en-Provence',
  'bauduen': 'Aix-en-Provence',
  'sainte-croix': 'Aix-en-Provence',
  'riez': 'Aix-en-Provence',
  'castellane': 'Nice',

  // Calanques & Cassis -> Marseille or Cassis
  'cassis': 'Marseille',
  'calanques': 'Marseille',
  'port-miou': 'Marseille',
  'en-vau': 'Marseille',

  // Luberon & Camargue -> Avignon / Arles
  'luberon': 'Avignon',
  'gordes': 'Avignon',
  'roussillon': 'Avignon',
  'lourmarin': 'Avignon',
  'camargue': 'Arles',
  'saintes-maries': 'Arles',
  'arles': 'Arles',

  // Etang de Berre -> Aix-en-Provence
  'velaux': 'Aix-en-Provence',
  'rognac': 'Aix-en-Provence',
  'berre': 'Aix-en-Provence',
  'vitrolles': 'Aix-en-Provence'
};

export function resolveSmartTourismDestination(destination?: string, locationName?: string, address?: string): string {
  const combinedText = `${destination || ''} ${locationName || ''} ${address || ''}`.toLowerCase();

  // 1. Check if text matches a famous regional hub in our map
  for (const [key, hub] of Object.entries(REGIONAL_HUB_MAP)) {
    if (combinedText.includes(key)) {
      return hub;
    }
  }

  // 2. Check for major global cities
  const majorCities = [
    'rome', 'paris', 'nice', 'lyon', 'marseille', 'annecy', 'bordeaux', 
    'toulouse', 'venise', 'florence', 'barcelone', 'madrid', 'londres', 
    'london', 'tokyo', 'kyoto', 'lisbonne', 'porto', 'amsterdam', 'bruxelles'
  ];

  for (const city of majorCities) {
    if (combinedText.includes(city)) {
      return city.charAt(0).toUpperCase() + city.slice(1);
    }
  }

  // 3. Clean raw destination string
  if (destination) {
    let clean = destination;
    clean = clean.replace(/Pépite surprise.*de\s+/gi, '');
    clean = clean.replace(/Pépite surprise.*:\s*/gi, '');
    clean = clean.replace(/à moins de\s+\d+\s*km\s+de\s+/gi, '');
    clean = clean.replace(/autour de\s+/gi, '');
    clean = clean.replace(/Week-end à\s+/gi, '');
    clean = clean.replace(/Escapade à\s+/gi, '');
    clean = clean.replace(/Séjour à\s+/gi, '');

    META_GPS_TERMS.forEach(term => {
      clean = clean.replace(new RegExp(term, 'gi'), '');
    });

    clean = clean.replace(/\d+([.,]\d+)?\s*(km)?/gi, '');
    clean = clean.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '').trim();

    const words = clean.split(' ').map(w => w.trim()).filter(w => w.length >= 3);
    const validWords = words.filter(w => !COUNTRIES_LIST.includes(w.toLowerCase()) && !META_GPS_TERMS.includes(w.toLowerCase()));

    if (validWords.length > 0) {
      return validWords.join(' ');
    }
  }

  return 'Provence';
}

export function resolveSmartTrainCity(destination?: string, trainStationName?: string): string {
  const combinedText = `${destination || ''} ${trainStationName || ''}`.toLowerCase();

  // 1. Check for specific natural spots mapped to real train hubs
  for (const [key, city] of Object.entries(TRAIN_HUB_MAP)) {
    if (combinedText.includes(key)) {
      return city;
    }
  }

  // 2. Extract city name from station name if provided
  if (trainStationName) {
    let cleanStation = trainStationName
      .replace(/Gare de/gi, '')
      .replace(/Gare d'/gi, '')
      .replace(/Gare/gi, '')
      .replace(/TGV/gi, '')
      .replace(/SNCF/gi, '')
      .replace(/\([^)]*\)/g, '')
      .trim();

    if (cleanStation && cleanStation.length >= 3 && !cleanStation.toLowerCase().includes('verdon')) {
      return cleanStation;
    }
  }

  // 3. Fallback to smart tourism destination hub
  return resolveSmartTourismDestination(destination);
}

/**
  1. ACTIVITÉS / EXCURSIONS: GetYourGuide (Direct Partner ID: DHWS2LP)
 */
export function getGetYourGuideHubUrl(destination?: string, partnerId: string = ''): string {
  const smartHub = resolveSmartTourismDestination(destination);
  const pid = partnerId && partnerId.trim() !== '' ? partnerId.trim() : DEFAULT_GYG_PARTNER_ID;
  return `https://www.getyourguide.com/s/?q=${encodeURIComponent(smartHub)}&partner_id=${encodeURIComponent(pid)}`;
}

export function getGetYourGuideUrl(locationName: string, destination?: string, partnerId: string = ''): string {
  const smartHub = resolveSmartTourismDestination(destination, locationName);

  const fullText = (locationName || '').toLowerCase();
  let matchedKeyword = '';
  for (const [key, label] of Object.entries(ACTIVITY_KEYWORDS)) {
    if (fullText.includes(key)) {
      matchedKeyword = label;
      break;
    }
  }

  let searchQuery = smartHub;
  if (matchedKeyword && !smartHub.toLowerCase().includes(matchedKeyword.toLowerCase())) {
    searchQuery = `${smartHub} ${matchedKeyword}`;
  }

  const pid = partnerId && partnerId.trim() !== '' ? partnerId.trim() : DEFAULT_GYG_PARTNER_ID;
  return `https://www.getyourguide.com/s/?q=${encodeURIComponent(searchQuery)}&partner_id=${encodeURIComponent(pid)}`;
}

/**
  2. HÔTELS & LOGEMENTS: Klook via Travelpayouts (Marker: 556489, Program ID p=3637)
 */
export function getBookingUrl(destination?: string, partnerId: string = ''): string {
  const smartHub = resolveSmartTourismDestination(destination);
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : DEFAULT_MARKER;
  const targetUrl = smartHub 
    ? `https://www.klook.com/fr/search/?query=${encodeURIComponent(smartHub)}`
    : `https://www.klook.com/fr/`;
  
  return `https://tp.media/r?marker=${marker}&p=3637&u=${encodeURIComponent(targetUrl)}`;
}

export function getKlookHotelUrl(destination: string, partnerId: string = ''): string {
  return getBookingUrl(destination, partnerId);
}

/**
  3. VOLS: Aviasales via Travelpayouts (Marker: 556489, Program ID p=100)
 */
export function getFlightUrl(_destinationOrIata?: string, partnerId: string = ''): string {
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : DEFAULT_MARKER;
  return `https://www.aviasales.fr/?marker=${marker}`;
}

/**
  4. TRAINS: Klook Trains via Travelpayouts (Marker: 556489, Program ID p=3637)
 */
export function getTrainlineUrl(destination?: string, partnerId: string = '', trainStationName?: string): string {
  const trainCity = resolveSmartTrainCity(destination, trainStationName);
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : DEFAULT_MARKER;
  const targetUrl = `https://www.klook.com/fr/search/?query=${encodeURIComponent('Train ' + trainCity)}`;

  return `https://tp.media/r?marker=${marker}&p=3637&u=${encodeURIComponent(targetUrl)}`;
}

/**
  5. VOITURES & SCOOTERS: GetRentacar via Travelpayouts (Marker: 556489, Program ID p=2567)
 */
export function getCarRentalUrl(_destination?: string, partnerId: string = ''): string {
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : DEFAULT_MARKER;
  return `https://getrentacar.tpx.lu/g216fbHt?marker=${marker}`;
}

/**
  6. ACTIVITÉS SECONDAIRES & BILLETS (GetYourGuide Fallback)
 */
export function getKlookActivityUrl(locationName: string, destination?: string, partnerId: string = ''): string {
  return getGetYourGuideUrl(locationName, destination, partnerId);
}

export function getTripadvisorUrl(locationName: string, destination?: string): string {
  return getGetYourGuideUrl(locationName, destination);
}
