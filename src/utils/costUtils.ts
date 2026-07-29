/**
  Robust price estimator parser.
  Handles ranges like "20-30 €" -> average 25 €
  "35-50 €" -> average 42.5 €
  "7 €" -> 7 €
  "Gratuit" -> 0 €
 */
export function parsePriceEstimate(priceStr?: string): number {
  if (!priceStr) return 0;
  const str = priceStr.toLowerCase().trim();
  
  if (str.includes('gratuit') || str.includes('offert') || str.includes('free') || str === '0') {
    return 0;
  }

  // Clean string and replace commas with dots
  const cleanStr = str.replace(/,/g, '.');

  // Check for range pattern like "20-30" or "20 - 30" or "20 à 30"
  const rangeMatch = cleanStr.match(/(\d+(?:\.\d+)?)\s*(?:-|–|—|à)\s*(\d+(?:\.\d+)?)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    if (!isNaN(min) && !isNaN(max)) {
      return (min + max) / 2;
    }
  }

  // Single number fallback
  const singleMatch = cleanStr.match(/(\d+(?:\.\d+)?)/);
  if (singleMatch) {
    const val = parseFloat(singleMatch[1]);
    return isNaN(val) ? 0 : val;
  }

  return 0;
}

export function formatPrice(amount: number, currency: string = 'EUR'): string {
  const symbol = currency === 'USD' ? '$' : currency === 'JPY' ? '¥' : currency === 'GBP' ? '£' : '€';
  if (amount === 0) return 'Gratuit';
  return `${Math.round(amount)} ${symbol}`;
}
