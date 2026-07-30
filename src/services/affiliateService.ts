/**
  Affiliate Link Generator for Escapades PWA
  - GetYourGuide: Direct Partner ID DHWS2LP
  - Booking.com & Klook Fallback: Travelpayouts Marker 556489 (Program 3637)
  - Aviasales: Travelpayouts Marker 556489 (aviasales.tp.st)
  - Travelpayouts Account ID: 758018
 */

const COUNTRIES_LIST = [
  'italie', 'france', 'espagne', 'portugal', 'grèce', 'grece', 
  'allemagne', 'royaume-uni', 'angleterre', 'japon', 'suisse', 
  'belgique', 'maroc', 'croatie', 'islande', 'norvège', 'suède'
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

  // Split by comma: e.g. "Rome, Italie" -> "Rome"
  if (clean.includes(',')) {
    const parts = clean.split(',').map(p => p.trim()).filter(Boolean);
    const cityPart = parts.find(p => !COUNTRIES_LIST.includes(p.toLowerCase()));
    clean = cityPart || parts[0];
  }

  // Remove trailing country names if present
  const words = clean.split(' ').map(w => w.trim()).filter(Boolean);
  const filteredWords = words.filter(w => !COUNTRIES_LIST.includes(w.toLowerCase()));
  if (filteredWords.length > 0) {
    clean = filteredWords.join(' ');
  }

  return clean.trim() || 'Rome';
}

/**
  1. GETYOURGUIDE (Direct Partner ID DHWS2LP — Pas de Travelpayouts)
 */
export function getGetYourGuideUrl(locationName: string, destination?: string, partnerId: string = ''): string {
  const cleanCity = destination ? cleanDestinationName(destination) : '';
  const query = cleanCity ? `${locationName} ${cleanCity}` : locationName;
  const pid = partnerId && partnerId.trim() !== '' ? partnerId.trim() : 'DHWS2LP';
  return `https://www.getyourguide.com/s/?q=${encodeURIComponent(query)}&partner_id=${encodeURIComponent(pid)}`;
}

/**
  2. HÔTELS / LOGEMENTS (Booking.com + Fallback Klook TP)
 */
export function getBookingUrl(destination: string, partnerId: string = ''): string {
  const cleanCity = cleanDestinationName(destination);
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : '556489';
  return `https://www.booking.com/searchresults.fr.html?ss=${encodeURIComponent(cleanCity)}&aid=304142&label=tp-${marker}`;
}

export function getKlookHotelUrl(destination: string, partnerId: string = ''): string {
  const cleanCity = cleanDestinationName(destination);
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : '556489';
  const targetUrl = `https://www.klook.com/fr/search/?query=${encodeURIComponent(cleanCity + ' hôtel')}`;
  return `https://tp.media/r?marker=${marker}&p=3637&u=${encodeURIComponent(targetUrl)}`;
}

/**
  3. VOLS (Aviasales via Travelpayouts tp.st Link)
 */
export function getFlightUrl(destination: string, partnerId: string = ''): string {
  const cleanCity = cleanDestinationName(destination);
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : '556489';
  return `https://aviasales.tp.st/search?destination=${encodeURIComponent(cleanCity)}&marker=${marker}`;
}

/**
  4. ACTIVITÉS SECONDAIRES & BILLETS (Klook / Tiqets via Travelpayouts)
 */
export function getKlookActivityUrl(locationName: string, destination?: string, partnerId: string = ''): string {
  const cleanCity = destination ? cleanDestinationName(destination) : '';
  const query = cleanCity ? `${locationName} ${cleanCity}` : locationName;
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : '556489';
  const targetUrl = `https://www.klook.com/fr/search/?query=${encodeURIComponent(query)}`;
  return `https://tp.media/r?marker=${marker}&p=3637&u=${encodeURIComponent(targetUrl)}`;
}

/**
  5. TRAINS (Trainline / SNCF Connect)
 */
export function getTrainlineUrl(destination: string): string {
  const cleanCity = cleanDestinationName(destination);
  return `https://www.google.com/search?q=${encodeURIComponent('billet train ' + cleanCity + ' reservation sncf trainline')}`;
}

export function getTripadvisorUrl(locationName: string, destination?: string): string {
  const cleanCity = destination ? cleanDestinationName(destination) : '';
  const query = cleanCity ? `${locationName} ${cleanCity}` : locationName;
  return `https://www.google.com/search?q=${encodeURIComponent(query + ' avis tripadvisor reservation')}`;
}
