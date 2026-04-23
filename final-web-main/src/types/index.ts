export type NavTab = 'main' | 'innov' | 'cards' | 'payments' | 'more';
export type SubTab = 'stocks' | 'deposits' | 'credits' | 'exchange' | 'piggy' | 'events' | 'intern' | 'quiz';

export interface ProductItem {
  name: string;
  short: string;
  full: string;
  btn: string;
  badge?: string;
  icon?: string;
  rate?: string;
  expiry?: string;
}

export interface QuizQuestion {
  q: string;
  opts: string[];
  correct: number;
}

export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  positive: boolean;
  date: string;
  category: 'food' | 'transport' | 'shopping' | 'health' | 'income' | 'transfer';
}

export interface ExchangeOffer {
  cost: number;
  reward: string;
  category: string;
}
