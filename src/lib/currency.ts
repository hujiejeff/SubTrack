export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  'CNY': 1,
  'USD': 7.2,
  'HKD': 0.92,
  'JPY': 0.048,
  'EUR': 7.8,
  'GBP': 9.1
};

export const convertToBase = (
  amount: number, 
  fromCurrency: string, 
  toCurrency: string = 'CNY',
  dynamicRates?: Record<string, number>
): number => {
  const rates = dynamicRates || DEFAULT_EXCHANGE_RATES;
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  
  if (fromCurrency === toCurrency) return amount;
  
  // If rates are relative to a base (e.g., CNY), then:
  // inBase = amount * fromRate
  // result = inBase / toRate
  // This assumes rates are "1 [Currency] = X [Base]"
  
  // However, most APIs provide "1 [Base] = X [Currency]"
  // So if Base is CNY, USD rate would be 0.14
  // inBase = amount / fromRate
  // result = inBase * toRate
  
  // Let's check if the rates look like "1 Base = X Currency" (usually < 1 for USD if base is CNY)
  // or "1 Currency = X Base" (usually > 7 for USD if base is CNY)
  
  const isBaseToCurrency = rates['USD'] < 1; // e.g. 0.14
  
  if (isBaseToCurrency) {
    const inBase = amount / fromRate;
    return inBase * toRate;
  } else {
    const inBase = amount * fromRate;
    return inBase / toRate;
  }
};

export const getCurrencySymbol = (currency: string): string => {
  try {
    return (0).toLocaleString('zh-CN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).replace(/\d/g, '').trim();
  } catch (e) {
    return currency === 'CNY' ? '¥' : '$';
  }
};

export const formatCurrency = (amount: number, currency: string = 'CNY'): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};
