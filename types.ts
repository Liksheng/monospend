
export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string; // ISO String
  excludeFromStats?: boolean; 
}

export interface Subscription {
  id: string;
  name: string;
  cost: number;
  frequency: 'monthly' | 'yearly';
  billingDate: string; // Day of month
}

export interface SmartParseResult {
  type: 'expense' | 'wishlist';
  amount: number;
  category?: string;
  description: string;
  date?: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  cost: number;
  url?: string;
}

export enum Category {
  Food = 'Food',
  Transport = 'Transport',
  Utilities = 'Utilities',
  Shopping = 'Shopping',
  Entertainment = 'Entertainment',
  Health = 'Health',
  Tech = 'Tech',
  Other = 'Other'
}

// THE Y2K SPECTRUM
export const CATEGORY_COLORS: Record<string, string> = {
  [Category.Food]: '#ff00ff',         // Magenta
  [Category.Transport]: '#00ffff',    // Cyan
  [Category.Utilities]: '#ffff00',    // Yellow
  [Category.Shopping]: '#39ff14',     // Neon Green
  [Category.Entertainment]: '#ff9900', // Orange
  [Category.Health]: '#ff0000',       // Red
  [Category.Tech]: '#0000ff',         // Blue
  [Category.Other]: '#ffffff',        // White
};

export interface BudgetState {
  income: number;
  total: number;
  categories: Record<string, number>;
}
