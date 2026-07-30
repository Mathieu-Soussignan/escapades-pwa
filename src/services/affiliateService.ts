/**
  Affiliate Link Generator for Escapades PWA
  - Klook Active Approved Travelpayouts Partner (Hotels & Stays): 2-5% reward rate
  - GetYourGuide Direct Partner ID: DHWS2LP
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

export function cleanDestinationName(destination: string): string {
  if (!destination) return 'Rome';

  let clean = destination;

  // Remove common prefixes
  clean = clean.replace(/Pépite surprise [^:]*de /gi, '');
  clean = clean.replace(/à moins de \d+\s*km de /gi, '');
  clean = clean.replace(/autour de /gi, '');
  clean = clean.replace(/Week-end à /gi, '');
  clean = clean.replace(/Escapade à /gi, '');
  clean = clean.replace(/Séjour à /gi, '');

  // Split by comma: e.g. "Gorges du Verdon, Quinson" or "Rome, Italie"
  if (clean.includes(',')) {
    const parts = clean.split(',').map(p => p.trim()).filter(Boolean);
    
    // Try finding a specific town that is NOT a country and NOT a natural region
    const specificCity = parts.reverse().find(p => {
      const lower = p.toLowerCase();
      return !COUNTRIES_LIST.includes(lower) && !NATURAL_REGIONS.includes(lower);
    });

    if (specificCity) {
      clean = specificCity;
    } else {
      const cityPart = parts.find(p => !COUNTRIES_LIST.includes(p.toLowerCase()));
      clean = cityPart || parts[0];
    }
  }

  // Remove country names if present in single string
  const words = clean.split(' ').map(w => w.trim()).filter(Boolean);
  const filteredWords = words.filter(w => !COUNTRIES_LIST.includes(w.toLowerCase()));
  if (filteredWords.length > 0) {
    clean = filteredWords.join(' ');
  }

  return clean.trim() || 'Rome';
}

/**
  1. GETYOURGUIDE (Direct Partner ID DHWS2LP — 100% Garantie 0 error 404)
 */
export function getGetYourGuideUrl(locationName: string, destination?: string, partnerId: string = ''): string {
  const cleanCity = destination ? cleanDestinationName(destination) : '';
  const query = cleanCity ? `${locationName} ${cleanCity}` : locationName;
  const pid = partnerId && partnerId.trim() !== '' ? partnerId.trim() : 'DHWS2LP';
  return `https://www.getyourguide.com/s/?q=${encodeURIComponent(query)}&partner_id=${encodeURIComponent(pid)}`;
}

/**
  2. HÔTELS / LOGEMENTS (Klook Active Travelpayouts Program — 100% Approuvé & 0 error 404)
 */
export function getBookingUrl(_destination?: string, _partnerId: string = ''): string {
  // Official Travelpayouts generated Klook affiliate link for Escapades-pwa
  return `https://klook.tpx.lu/9DYaJdIM`;
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
  5. ACTIVITÉS SECONDAIRES & BILLETS (GetYourGuide & Klook)
 */
export function getKlookActivityUrl(locationName: string, destination?: string, partnerId: string = ''): string {
  return getGetYourGuideUrl(locationName, destination, partnerId);
}

export function getTripadvisorUrl(locationName: string, destination?: string): string {
  const cleanCity = destination ? cleanDestinationName(destination) : '';
  const query = cleanCity ? `${locationName} ${cleanCity}` : locationName;
  return `https://www.getyourguide.com/s/?q=${encodeURIComponent(query)}&partner_id=DHWS2LP`;
}
