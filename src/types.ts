export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'expired' | 'trial';
export type BillingCycle = 'monthly' | 'quarterly' | 'semi-annually' | 'yearly';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string; // e.g., 'USD', 'CNY', 'HKD', 'JPY'
  cycle: BillingCycle;
  startDate: string;
  endDate?: string;
  nextBillingDate: string;
  status: SubscriptionStatus;
  category: string;
  color: string;
  icon?: string;
  isTrial?: boolean;
  trialEndDate?: string;
}

export interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  lastUpdate: string;
}

export interface SpendingStats {
  monthlyTotal: number;
  yearlyTotal: number;
  activeCount: number;
  categoryBreakdown: { name: string; value: number; color: string; icon?: string }[];
  itemBreakdown: { name: string; value: number; color: string; icon?: string }[];
  trends: { month: string; amount: number }[];
  upcomingSubscription?: Subscription;
}

export interface SyncConfig {
  method: 'none' | 'webdav' | 'gist';
  webdav?: {
    url: string;
    username: string;
    password?: string;
  };
  gist?: {
    token: string;
    gistId?: string;
  };
  lastSyncAt?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  theme: 'light' | 'dark' | 'system';
  baseCurrency: string;
  syncConfig?: SyncConfig;
  displayMode: 'standard' | 'compact' | 'mini';
  sortBy: 'date' | 'price' | 'name';
}
