/**
  Affiliate Link Generator for Travelpayouts, GetYourGuide, Booking.com, Aviasales & Trainline
  Travelpayouts Marker ID: 556489
  Travelpayouts Account ID: 758018
 */
export function getGetYourGuideUrl(locationName: string, destination?: string, partnerId: string = ''): string {
  const query = destination ? `${locationName} ${destination}` : locationName;
  const baseUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(query)}`;
  
  // Use custom partnerId or default Travelpayouts / GetYourGuide Partner ID
  const pid = partnerId && partnerId.trim() !== '' ? partnerId.trim() : 'DHWS2LP';
  return `${baseUrl}&partner_id=${encodeURIComponent(pid)}`;
}

export function getBookingUrl(destination: string, partnerId: string = ''): string {
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : '556489';
  const query = destination ? destination.trim() : 'France';
  return `https://www.booking.com/searchresults.fr.html?ss=${encodeURIComponent(query)}&aid=304142&label=tp-${marker}`;
}

export function getTrainlineUrl(destination: string, partnerId: string = ''): string {
  const query = destination ? destination.trim() : 'Paris';
  return `https://www.sncf-connect.com/recherche?destination=${encodeURIComponent(query)}`;
}

export function getFlightUrl(destination: string, partnerId: string = ''): string {
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : '556489';
  const query = destination ? destination.trim() : 'Paris';
  return `https://www.aviasales.com/search?destination=${encodeURIComponent(query)}&marker=${marker}`;
}

export function getTripadvisorUrl(locationName: string, destination?: string): string {
  const query = destination ? `${locationName} ${destination}` : locationName;
  return `https://www.google.com/search?q=${encodeURIComponent(query + ' avis tripadvisor reservation')}`;
}
