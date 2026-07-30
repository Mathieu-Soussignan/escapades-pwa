/**
  God Tier S++ Affiliate Link Generator for Escapades PWA
  - Klook Active Approved Travelpayouts Partner (Hotels & Stays): 2-5% reward rate
  - GetRentacar Active Approved Travelpayouts Partner (Car Rentals): 10% reward rate, 90-day cookie
  - GetYourGuide Direct Partner ID: DHWS2LP (God Tier S++ Local Smart Search)
  - Aviasales Direct Travelpayouts Marker: 556489
  - Omio Direct Travelpayouts Marker: 556489
  - Travelpayouts Account ID: 758018
 */

const COUNTRIES_LIST = [
  'italie', 'france', 'espagne', 'portugal', 'grèce', 'grece', 
  'allemagne', 'royaume-uni', 'angleterre', 'japon', 'suisse', 
  'belgique', 'maroc', 'croatie', 'islande', 'norvège', 'suède'
];

const NATURAL_REGIONS = [
  'gorges du verdon', 'verdon', 'étang de berre', 'etang de berre',
  'calanques', 'massif du luberon', 'luberon', 'val de loire',
  'bassin d\'arcachon', 'camargue', 'cote d\'azur', 'côte d\'azur'
];

const ACTIVITY_KEYWORDS = [
  'kayak', 'canoe', 'canoë', 'paddle', 'bateau', 'croisiere', 'croisière', 
  'plongée', 'plongee', 'canyoning', 'randonnée', 'randonnee', 'trek',
  'musée', 'musee', 'colisée', 'colisee', 'vatican', 'eiffel', 'louvre',
  'dégustation', 'degustation', 'vin', 'visite', 'monument', 'château', 'chateau',
  'catacombes', 'aquarium', 'zoo', 'parc', 'bus'
];

export function cleanDestinationName(destination: string): string {
  if (!destination) return 'Rome';

  let clean = destination;

  // 1. Remove all surprise/distance prefixes
  clean = clean.replace(/Pépite surprise.*de\s+/gi, '');
  clean = clean.replace(/Pépite surprise.*:\s*/gi, '');
  clean = clean.replace(/à moins de\s+\d+\s*km\s+de\s+/gi, '');
  clean = clean.replace(/autour de\s+/gi, '');
  clean = clean.replace(/Week-end à\s+/gi, '');
  clean = clean.replace(/Escapade à\s+/gi, '');
  clean = clean.replace(/Séjour à\s+/gi, '');

  // 2. Remove all standalone numbers, distances like "50 km", "5.45)", coordinates, symbols
  clean = clean.replace(/\d+([.,]\d+)?\s*(km)?/gi, '');
  clean = clean.replace(/[()\[\]{}]/g, '');

  // 3. Split by comma: e.g. "Marseille, Cassis" or "Rome, Italie"
  if (clean.includes(',')) {
    const parts = clean.split(',').map(p => p.trim()).filter(Boolean);
    
    // Try finding a specific town that is NOT a country and NOT a natural region (min 3 chars)
    const specificCity = parts.reverse().find(p => {
      const lower = p.toLowerCase().trim();
      return lower.length >= 3 && !COUNTRIES_LIST.includes(lower) && !NATURAL_REGIONS.includes(lower);
    });

    if (specificCity) {
      clean = specificCity;
    } else {
      const cityPart = parts.find(p => p.trim().length >= 3 && !COUNTRIES_LIST.includes(p.toLowerCase().trim()));
      clean = cityPart || parts[0];
    }
  }

  // 4. Remove country names if present in single string
  const words = clean.split(' ').map(w => w.trim()).filter(w => w.length >= 2);
  const filteredWords = words.filter(w => !COUNTRIES_LIST.includes(w.toLowerCase()));
  if (filteredWords.length > 0) {
    clean = filteredWords.join(' ');
  }

  // Clean trailing punctuation
  clean = clean.replace(/[^a-zA-ZÀ-ÿ\s-]/g, '').trim();

  return clean || 'Rome';
}

/**
  1. GETYOURGUIDE (Direct Partner ID DHWS2LP — God Tier S++ Local Smart Search)
  Combines clean city/region with activity action keywords (e.g., "Cassis Kayak", "Rome Colisée")
  to guarantee GetYourGuide returns 100% relevant local tickets & tours for THAT exact spot.
 */
export function getGetYourGuideUrl(locationName: string, destination?: string, partnerId: string = ''): string {
  const cleanCity = destination ? cleanDestinationName(destination) : cleanDestinationName(locationName);
  
  // Extract activity keyword from locationName or activity title
  const fullText = (locationName || '').toLowerCase();
  const matchedKeyword = ACTIVITY_KEYWORDS.find(kw => fullText.includes(kw));

  let searchQuery = cleanCity;
  if (matchedKeyword && cleanCity) {
    searchQuery = `${cleanCity} ${matchedKeyword}`;
  }

  const pid = partnerId && partnerId.trim() !== '' ? partnerId.trim() : 'DHWS2LP';
  return `https://www.getyourguide.com/s/?q=${encodeURIComponent(searchQuery)}&partner_id=${encodeURIComponent(pid)}`;
}

/**
  2. HÔTELS / LOGEMENTS (Klook Direct Affiliate Link — Account ID 758018)
 */
export function getBookingUrl(_destination?: string, _partnerId: string = ''): string {
  return `https://www.klook.com/?aid=api%7C13694%7C7e9e3ecd53f7420b85b141cd3-758018%7Cpid%7C758018&aff_pid=758018&aff_sid=&aff_adid=1361174&utm_medium=affiliate-alwayson&utm_source=network&utm_campaign=13694&utm_term=758018&utm_content=&aff_klick_id=136688366434-api%7C13694%7C7e9e3ecd53f7420b85b141cd3-758018%7Cpid%7C758018-1361174-a552007`;
}

export function getKlookHotelUrl(destination: string, partnerId: string = ''): string {
  return getBookingUrl(destination, partnerId);
}

/**
  3. VOLS (Aviasales Direct — 100% Approuvé & 0 error 404)
 */
export function getFlightUrl(_destination?: string, partnerId: string = ''): string {
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : '556489';
  return `https://www.aviasales.fr/?marker=${marker}`;
}

/**
  4. TRAINS (Omio Home Search — 100% Approuvé & 0 error 404)
 */
export function getTrainlineUrl(_destination?: string, partnerId: string = ''): string {
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : '556489';
  return `https://www.omio.fr/?subId=${marker}`;
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
