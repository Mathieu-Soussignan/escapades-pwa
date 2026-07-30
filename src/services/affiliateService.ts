/**
  Affiliate Link Generator for Travelpayouts, GetYourGuide, Booking.com, Aviasales & Trainline
  Travelpayouts Marker ID: 556489
  Travelpayouts Account ID: 758018
 */

export function cleanDestinationName(destination: string): string {
  if (!destination) return 'France';

  let clean = destination;

  // Remove surprise prefixes
  clean = clean.replace(/Pépite surprise [^:]*de /gi, '');
  clean = clean.replace(/à moins de \d+\s*km de /gi, '');
  clean = clean.replace(/autour de /gi, '');

  // If contains commas like "Gorges du verdon, Quinson", extract the specific town/city
  if (clean.includes(',')) {
    const parts = clean.split(',').map(p => p.trim()).filter(Boolean);
    clean = parts[parts.length - 1] || parts[0];
  }

  return clean.trim() || 'France';
}

export function getGetYourGuideUrl(locationName: string, destination?: string, partnerId: string = ''): string {
  const cleanDest = destination ? cleanDestinationName(destination) : '';
  const query = cleanDest ? `${locationName} ${cleanDest}` : locationName;
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
  // Trainline search deep link with clean city name
  return `https://www.thetrainline.com/fr/recherche/${encodeURIComponent(cleanCity)}`;
}

export function getFlightUrl(destination: string, partnerId: string = ''): string {
  const cleanCity = cleanDestinationName(destination);
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : '556489';
  // Aviasales deep link with clean city
  return `https://www.aviasales.com/search?destination=${encodeURIComponent(cleanCity)}&marker=${marker}`;
}

export function getTripadvisorUrl(locationName: string, destination?: string): string {
  const cleanDest = destination ? cleanDestinationName(destination) : '';
  const query = cleanDest ? `${locationName} ${cleanDest}` : locationName;
  return `https://www.google.com/search?q=${encodeURIComponent(query + ' avis tripadvisor reservation')}`;
}
