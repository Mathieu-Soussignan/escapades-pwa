/**
  God Tier S++ Ultra-Intelligent Affiliate Link Generator for Escapades PWA
  - Klook Active Approved Travelpayouts Partner (Hotels & Stays): 2-5% reward rate
  - Klook Trains Active Approved Partner (Trains & Rail): 2-5% reward rate (SNCF, TGV, OUIGO, Eurostar)
  - GetRentacar Active Approved Travelpayouts Partner (Car Rentals): 10% reward rate, 90-day cookie
  - GetYourGuide Direct Partner ID: DHWS2LP (Ultra-Intelligent Regional Tourism Resolver)
  - Aviasales Direct Travelpayouts Marker: 556489
  - Travelpayouts Account ID: 758018
 */

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

/**
  Global Trip Excursions & Activities Hub URL (for the top booking bar)
 */
export function getGetYourGuideHubUrl(destination?: string, partnerId: string = ''): string {
  const smartHub = resolveSmartTourismDestination(destination);
  const pid = partnerId && partnerId.trim() !== '' ? partnerId.trim() : 'DHWS2LP';
  return `https://www.getyourguide.com/s/?q=${encodeURIComponent(smartHub)}&partner_id=${encodeURIComponent(pid)}`;
}

/**
  1. GETYOURGUIDE (Direct Partner ID DHWS2LP — Individual Activity Ticket Search)
 */
export function getGetYourGuideUrl(locationName: string, destination?: string, partnerId: string = ''): string {
  const smartHub = resolveSmartTourismDestination(destination, locationName);

  // Extract action keyword if present
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

  const pid = partnerId && partnerId.trim() !== '' ? partnerId.trim() : 'DHWS2LP';
  return `https://www.getyourguide.com/s/?q=${encodeURIComponent(searchQuery)}&partner_id=${encodeURIComponent(pid)}`;
}

/**
  2. HÔTELS / LOGEMENTS (Klook Direct Affiliate Link — Pre-searched by Destination)
 */
export function getBookingUrl(destination?: string, partnerId: string = ''): string {
  const smartHub = resolveSmartTourismDestination(destination);
  const pid = partnerId && partnerId.trim() !== '' ? partnerId.trim() : '758018';
  const affParams = `aid=api%7C13694%7C7e9e3ecd53f7420b85b141cd3-${pid}&pid=${pid}&aff_pid=${pid}&aff_sid=&aff_adid=1361174&utm_medium=affiliate-alwayson&utm_source=network&utm_campaign=13694&utm_term=${pid}`;

  if (smartHub) {
    return `https://www.klook.com/fr/search/?query=${encodeURIComponent(smartHub)}&${affParams}`;
  }
  return `https://www.klook.com/fr/?${affParams}`;
}

export function getKlookHotelUrl(destination: string, partnerId: string = ''): string {
  return getBookingUrl(destination, partnerId);
}

/**
  3. VOLS (Aviasales Direct — 100% Approuvé & 0 error 404)
  Always opens Aviasales official flight search engine in French with active affiliate marker.
 */
export function getFlightUrl(_destinationOrIata?: string, partnerId: string = ''): string {
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : '556489';
  return `https://www.aviasales.fr/?marker=${marker}`;
}

/**
  4. TRAINS (Klook Trains Direct — Approved Travelpayouts / Klook Partner ID 758018)
 */
export function getTrainlineUrl(_destination?: string, partnerId: string = ''): string {
  const pid = partnerId && partnerId.trim() !== '' ? partnerId.trim() : '758018';
  const affParams = `aid=api%7C13694%7C7e9e3ecd53f7420b85b141cd3-${pid}&pid=${pid}&aff_pid=${pid}&aff_sid=&aff_adid=1361174&utm_medium=affiliate-alwayson&utm_source=network&utm_campaign=13694&utm_term=${pid}`;
  return `https://www.klook.com/fr/transport/?target_product_id=4&${affParams}`;
}

/**
  5. VOITURES & SCOOTERS (GetRentacar Official Travelpayouts Link — 10% reward rate, 90-day cookie)
 */
export function getCarRentalUrl(_destination?: string, _partnerId: string = ''): string {
  return `https://getrentacar.tpx.lu/g216fbHt`;
}

/**
  6. ACTIVITÉS SECONDAIRES & BILLETS (GetYourGuide & Klook)
 */
export function getKlookActivityUrl(locationName: string, destination?: string, partnerId: string = ''): string {
  return getGetYourGuideUrl(locationName, destination, partnerId);
}

export function getTripadvisorUrl(locationName: string, destination?: string): string {
  return getGetYourGuideUrl(locationName, destination);
}
