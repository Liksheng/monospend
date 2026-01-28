
import React, { useMemo } from 'react';
import { Expense } from '../types';
import { TrendingDown, AlertTriangle } from 'lucide-react';

interface PredictiveModellingProps {
  expenses: Expense[];
  currentReserves: number;
}

const PredictiveModelling: React.FC<PredictiveModellingProps> = ({ expenses, currentReserves }) => {
  
  const prediction = useMemo(() => {
      if (expenses.length < 5) return null;

      const now = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(now.getMonth() - 3);

      const recentExpenses = expenses.filter(e => new Date(e.date) >= threeMonthsAgo);
      if (recentExpenses.length === 0) return null;

      const totalSpent = recentExpenses.reduce((acc, curr) => acc + curr.amount, 0);
      
      // Approximate days passed
      const earliest = recentExpenses.reduce((min, e) => e.date < min ? e.date : min, recentExpenses[0].date);
      const daysDiff = Math.max(1, (now.getTime() - new Date(earliest).getTime()) / (1000 * 3600 * 24));
      
      const dailyBurnRate = totalSpent / daysDiff;
      
      if (dailyBurnRate <= 0) return null;

      const daysUntilDepletion = currentReserves / dailyBurnRate;
      
      return {
          dailyBurn: dailyBurnRate,
          daysLeft: Math.floor(daysUntilDepletion)
      };

  }, [expenses, currentReserves]);

  if (!prediction || currentReserves <= 0) {
      return (
        <div className="border border-zinc-800 p-2 text-zinc-600 text-xs font-mono text-center">
            INSUFFICIENT DATA FOR PREDICTION MODEL
        </div>
      );
  }

  const isCritical = prediction.daysLeft < 30;

  return (
    <div className={`border p-2 font-mono text-xs flex flex-col gap-1 ${isCritical ? 'border-red-900 bg-red-900/10' : 'border-y2k-cyan/30 bg-black/40'}`}>
        <div className="flex items-center gap-2 uppercase font-bold tracking-wider mb-1">
            <TrendingDown className={`w-3 h-3 ${isCritical ? 'text-red-500' : 'text-y2k-cyan'}`} />
            <span className={isCritical ? 'text-red-500' : 'text-y2k-cyan'}>Predictive_Modelling</span>
        </div>
        
        <div className="flex justify-between items-end">
            <span className="text-zinc-400">Daily Burn:</span>
            <span className="text-white">${prediction.dailyBurn.toFixed(2)}</span>
        </div>

        <div className="mt-2 border-t border-dashed border-white/10 pt-2">
            {isCritical && <AlertTriangle className="w-4 h-4 text-red-500 mb-1 animate-bounce" />}
            <p className={isCritical ? 'text-red-400' : 'text-y2k-green'}>
                At curr. rate, reserves deplete in: <span className="text-lg font-bold">{prediction.daysLeft} DAYS</span>.
            </p>
        </div>
    </div>
  );
};

export default PredictiveModelling;
