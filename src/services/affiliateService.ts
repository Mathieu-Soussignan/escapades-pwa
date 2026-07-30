/**
  Affiliate Link Generator for Escapades PWA
  - GetYourGuide: Direct Partner ID DHWS2LP
  - Flights (WayAway TP Program 100): Marker 556489
  - Trains (Omio TP Program 3923): Marker 556489
  - Hotels (Klook Stays TP Program 3637): Marker 556489
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
  2. HÔTELS / LOGEMENTS (Klook Stays TP Program 3637)
 */
export function getBookingUrl(destination: string, partnerId: string = ''): string {
  const cleanCity = cleanDestinationName(destination);
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : '556489';
  const targetUrl = `https://www.klook.com/fr/hotels/search/?keyword=${encodeURIComponent(cleanCity)}`;
  return `https://tp.media/r?marker=${marker}&p=3637&u=${encodeURIComponent(targetUrl)}`;
}

export function getKlookHotelUrl(destination: string, partnerId: string = ''): string {
  return getBookingUrl(destination, partnerId);
}

/**
  3. VOLS (Fix 404 Aviasales via WayAway TP Program 100)
 */
export function getFlightUrl(destination: string, partnerId: string = ''): string {
  const cleanCity = cleanDestinationName(destination);
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : '556489';
  const targetUrl = `https://wayaway.io/search?destination=${encodeURIComponent(cleanCity)}`;
  return `https://tp.media/r?marker=${marker}&p=100&u=${encodeURIComponent(targetUrl)}`;
}

/**
  4. TRAINS (Redirection Omio TP Program 3923)
 */
export function getTrainlineUrl(destination: string, partnerId: string = ''): string {
  const cleanCity = cleanDestinationName(destination);
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : '556489';
  const targetUrl = `https://www.omio.fr/srp/search-page?destination=${encodeURIComponent(cleanCity)}`;
  return `https://tp.media/r?marker=${marker}&p=3923&u=${encodeURIComponent(targetUrl)}`;
}

/**
  5. ACTIVITÉS SECONDAIRES & BILLETS (Klook via Travelpayouts)
 */
export function getKlookActivityUrl(locationName: string, destination?: string, partnerId: string = ''): string {
  const cleanCity = destination ? cleanDestinationName(destination) : '';
  const query = cleanCity ? `${locationName} ${cleanCity}` : locationName;
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : '556489';
  const targetUrl = `https://www.klook.com/fr/search/?query=${encodeURIComponent(query)}`;
  return `https://tp.media/r?marker=${marker}&p=3637&u=${encodeURIComponent(targetUrl)}`;
}

export function getTripadvisorUrl(locationName: string, destination?: string): string {
  const cleanCity = destination ? cleanDestinationName(destination) : '';
  const query = cleanCity ? `${locationName} ${cleanCity}` : locationName;
  return `https://www.google.com/search?q=${encodeURIComponent(query + ' avis tripadvisor reservation')}`;
}
