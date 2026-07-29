/**
  Affiliate Link Generator for GetYourGuide, Booking.com, and Viator
 */
export function getGetYourGuideUrl(locationName: string, destination?: string, partnerId: string = ''): string {
  const query = destination ? `${locationName} ${destination}` : locationName;
  const baseUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(query)}`;
  
  // Use user partnerId or default fallback partner ID
  const pid = partnerId && partnerId.trim() !== '' ? partnerId.trim() : 'DHWS2LP';
  return `${baseUrl}&partner_id=${encodeURIComponent(pid)}`;
}

export function getBookingUrl(destination: string, partnerId: string = ''): string {
  const baseUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`;
  if (partnerId && partnerId.trim() !== '') {
    return `${baseUrl}&aid=${encodeURIComponent(partnerId.trim())}`;
  }
  return baseUrl;
}

export function getTripadvisorUrl(locationName: string, destination?: string): string {
  const query = destination ? `${locationName} ${destination}` : locationName;
  return `https://www.google.com/search?q=${encodeURIComponent(query + ' avis tripadvisor reservation')}`;
}
