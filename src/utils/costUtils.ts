/**
  Helper utility to parse price estimate strings (e.g. "28 €", "35 € / h", "15 EUR", "Gratuit", "4,50 €")
  into a numeric float value.
 */
export function parsePriceEstimate(priceStr?: string): number {
  if (!priceStr) return 0;
  const str = priceStr.toLowerCase().trim();
  
  if (str.includes('gratuit') || str.includes('offert') || str.includes('free') || str === '0') {
    return 0;
  }

  // Replace comma with dot for float parsing
  const cleanStr = str.replace(',', '.');
  
  // Regex to extract first number (int or float)
  const match = cleanStr.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    return parseFloat(match[1]);
  }

  return 0;
}

export function formatPrice(amount: number, currency: string = 'EUR'): string {
  const symbol = currency === 'USD' ? '$' : currency === 'JPY' ? '¥' : currency === 'GBP' ? '£' : '€';
  if (amount === 0) return 'Gratuit';
  return `${Math.round(amount)} ${symbol}`;
}
