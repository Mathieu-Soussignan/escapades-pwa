/**
  Affiliate Link Generator for Travelpayouts, GetYourGuide, Booking.com, Aviasales & Trains
  Travelpayouts Marker ID: 556489
  Travelpayouts Account ID: 758018
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

export function getGetYourGuideUrl(locationName: string, destination?: string, partnerId: string = ''): string {
  const cleanCity = destination ? cleanDestinationName(destination) : '';
  const query = cleanCity ? `${locationName} ${cleanCity}` : locationName;
  const baseUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(query)}`;
  
  const pid = partnerId && partnerId.trim() !== '' ? partnerId.trim() : 'DHWS2LP';
  return `${baseUrl}&partner_id=${encodeURIComponent(pid)}`;
}

export function getBookingUrl(destination: string, partnerId: string = ''): string {
  const cleanCity = cleanDestinationName(destination);
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : '556489';
  return `https://www.booking.com/searchresults.fr.html?ss=${encodeURIComponent(cleanCity)}&aid=304142&label=tp-${marker}`;
}

export function getTrainlineUrl(destination: string, partnerId: string = ''): string {
  const cleanCity = cleanDestinationName(destination);
  // Google Trains / SNCF Search query that NEVER fails for any destination (Rome, Quinson, Paris, etc.)
  return `https://www.google.com/search?q=${encodeURIComponent('billet train ' + cleanCity + ' reservation sncf trainline')}`;
}

export function getFlightUrl(destination: string, partnerId: string = ''): string {
  const cleanCity = cleanDestinationName(destination);
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : '556489';
  // Aviasales or Google Flights search query that works 100% for any city in the world
  return `https://www.google.com/travel/flights?q=${encodeURIComponent('vol vers ' + cleanCity)}`;
}

export function getTripadvisorUrl(locationName: string, destination?: string): string {
  const cleanCity = destination ? cleanDestinationName(destination) : '';
  const query = cleanCity ? `${locationName} ${cleanCity}` : locationName;
  return `https://www.google.com/search?q=${encodeURIComponent(query + ' avis tripadvisor reservation')}`;
}
