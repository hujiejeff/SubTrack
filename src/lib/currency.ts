export const EXCHANGE_RATES: Record<string, number> = {
  'CNY': 1,
  'USD': 7.2,
  'HKD': 0.92,
  'JPY': 0.048,
  'EUR': 7.8,
  'GBP': 9.1
};

export const convertToBase = (amount: number, fromCurrency: string, toCurrency: string = 'CNY'): number => {
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;
  
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to CNY first then to target
  const inCNY = amount * fromRate;
  return inCNY / toRate;
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
