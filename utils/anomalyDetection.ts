import { Expense } from '../types'; // Adjust path if your types are elsewhere

// Pure function: Takes a value and history, returns an object with validation result
export const checkAnomaly = (
  amount: number, 
  history: Expense[], 
  category: string
): { isAnomaly: boolean; average: number } => {
  
  // 1. Filter history for this category
  const catExpenses = history.filter(e => e.category === category);

  // 2. Need enough data to be statistically significant
  if (catExpenses.length < 5) {
    return { isAnomaly: false, average: 0 };
  }

  // 3. Calculate Average
  const total = catExpenses.reduce((sum, e) => sum + e.amount, 0);
  const avg = total / catExpenses.length;

  // 4. Check if amount is > 300% of average AND greater than $50
  const isAnomaly = amount > avg * 3 && amount > 50;

  return { isAnomaly, average: avg };
};