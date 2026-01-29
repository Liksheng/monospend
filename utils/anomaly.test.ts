import { describe, it, expect } from 'vitest';
import { checkAnomaly } from './anomalyDetection';
import { Expense } from '../types'; 

describe('Anomaly Detection Logic', () => {
  // Mock Data: 5 items with average of $15
  const mockHistory: Expense[] = [
    { id: '1', amount: 10, category: 'Food', description: 't', date: '2026-01-01', type: 'expense' },
    { id: '2', amount: 20, category: 'Food', description: 't', date: '2026-01-01', type: 'expense' },
    { id: '3', amount: 15, category: 'Food', description: 't', date: '2026-01-01', type: 'expense' },
    { id: '4', amount: 10, category: 'Food', description: 't', date: '2026-01-01', type: 'expense' },
    { id: '5', amount: 20, category: 'Food', description: 't', date: '2026-01-01', type: 'expense' },
  ];

  it('should flag expense if > 300% of average', () => {
    // Average is 15. 300% is 45. Input is 60.
    const result = checkAnomaly(60, mockHistory, 'Food');
    expect(result.isAnomaly).toBe(true);
  });

  it('should allow expense if within normal range', () => {
    // Input is 25 (safe)
    const result = checkAnomaly(25, mockHistory, 'Food');
    expect(result.isAnomaly).toBe(false);
  });
});