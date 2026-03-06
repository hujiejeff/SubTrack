import { ExchangeRates } from '../types';

const API_URL = 'https://open.er-api.com/v6/latest/';

export const fetchExchangeRates = async (base: string = 'CNY'): Promise<ExchangeRates | null> => {
  try {
    const response = await fetch(`${API_URL}${base}`);
    if (!response.ok) throw new Error('Failed to fetch rates');
    const data = await response.json();
    return {
      base: data.base_code,
      rates: data.rates,
      lastUpdate: data.time_last_update_utc
    };
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    return null;
  }
};
