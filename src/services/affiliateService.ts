/**
  Affiliate Link Generator for Travelpayouts, GetYourGuide & Booking.com
  Travelpayouts Marker ID: 556489
 */
export function getGetYourGuideUrl(locationName: string, destination?: string, partnerId: string = ''): string {
  const query = destination ? `${locationName} ${destination}` : locationName;
  const baseUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(query)}`;
  
  // Use custom partnerId or default Travelpayouts / GetYourGuide Partner ID
  const pid = partnerId && partnerId.trim() !== '' ? partnerId.trim() : 'DHWS2LP';
  return `${baseUrl}&partner_id=${encodeURIComponent(pid)}`;
}

export function getBookingUrl(destination: string, partnerId: string = ''): string {
  const baseUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`;
  const marker = partnerId && partnerId.trim() !== '' ? partnerId.trim() : '556489';
  return `${baseUrl}&aid=304142&label=tp-${marker}`;
}

export function getTripadvisorUrl(locationName: string, destination?: string): string {
  const query = destination ? `${locationName} ${destination}` : locationName;
  return `https://www.google.com/search?q=${encodeURIComponent(query + ' avis tripadvisor reservation')}`;
}
