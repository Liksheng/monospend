import { describe, it, expect } from 'vitest';
import { checkAnomaly } from './anomalyDetection';
import { Expense } from '../types';

describe('Anomaly Detection Engine', () => {
  // Helper function to generate mock historical data
  const generateHistory = (count: number, amount: number, category: string): Expense[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `test-id-${i}`,
      amount,
      category,
      date: new Date().toISOString(),
      description: 'Automated test entry'
    }));
  };

  it('TC-001: Returns false when historical data is insufficient (< 5 items)', () => {
    const history = generateHistory(4, 10, 'Food');
    const result = checkAnomaly(100, history, 'Food');
    expect(result).toEqual({ isAnomaly: false, average: 0 });
  });

  it('TC-002: Returns false for normal expenses within expected ranges', () => {
    const history = generateHistory(5, 10, 'Food');
    const result = checkAnomaly(20, history, 'Food'); // 20 is <= 30
    expect(result).toEqual({ isAnomaly: false, average: 10 });
  });

  it('TC-003: Returns false if amount exceeds multiplier but not the $50 absolute threshold', () => {
    const history = generateHistory(5, 10, 'Food');
    const result = checkAnomaly(40, history, 'Food'); // 40 > 30, but not > 50
    expect(result).toEqual({ isAnomaly: false, average: 10 });
  });

  it('TC-004: Returns false if amount exceeds $50 but not the 3x multiplier', () => {
    const history = generateHistory(5, 25, 'Food');
    const result = checkAnomaly(60, history, 'Food'); // 60 > 50, but not > 75
    expect(result).toEqual({ isAnomaly: false, average: 25 });
  });

  it('TC-005: Returns true when an anomaly condition is perfectly met', () => {
    const history = generateHistory(5, 10, 'Food');
    const result = checkAnomaly(60, history, 'Food'); // 60 > 30 AND 60 > 50
    expect(result).toEqual({ isAnomaly: true, average: 10 });
  });
});