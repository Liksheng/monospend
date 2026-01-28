
import React from 'react';
import { Expense, BudgetState } from '../types';
import { Settings2 } from 'lucide-react';

interface CategoryBudgetListProps {
  expenses: Expense[];
  budgets: BudgetState;
  onOpenSettings: () => void;
}

const CategoryBudgetList: React.FC<CategoryBudgetListProps> = ({ expenses, budgets, onOpenSettings }) => {
  const categories = budgets?.categories || {};
  const categoriesWithBudgets = (Object.entries(categories) as [string, number][]).filter(([_, limit]) => limit > 0);

  const now = new Date();
  const currentMonthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const spendMap = currentMonthExpenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const renderBar = (current: number, max: number) => {
      const percent = Math.min((current / max) * 100, 100);
      const isClipping = current > max;
      const barColor = isClipping ? 'bg-red-500' : percent > 80 ? 'bg-yellow-400' : 'bg-y2k-green';

      return (
          <div className="h-5 w-full bg-gray-900 border-2 border-gray-700 relative mt-1 overflow-hidden">
              <div 
                className={`h-full ${barColor} absolute top-0 left-0 shadow-[0_0_10px_currentColor]`} 
                style={{ width: `${percent}%` }}
              ></div>
              
              {/* Scanline overlay on bar */}
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.5)_2px,transparent_2px)] bg-[length:4px_100%] pointer-events-none"></div>
              
              {/* Active processing scan */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-marquee pointer-events-none"></div>
          </div>
      )
  }

  return (
    <div className="h-full flex flex-col">
        {/* Header with Settings Button */}
        <div className="flex justify-between items-center mb-3">
            <div className="bg-y2k-green text-black text-xs px-2 font-bold inline-block uppercase border border-y2k-green w-fit">Limiters</div>
            <button 
                onClick={onOpenSettings}
                className="text-y2k-green hover:text-white transition-colors hover:rotate-90 duration-300"
                title="Configure Limits"
            >
                <Settings2 className="w-4 h-4" />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
            {categoriesWithBudgets.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-y2k-green/50 animate-pulse">
                    <h3 className="text-sm font-mono uppercase font-bold tracking-widest">[SLOT EMPTY]</h3>
                    <p className="text-[9px] mt-2">Click gear icon to add limits</p>
                </div>
            ) : (
                categoriesWithBudgets.map(([category, limit]) => {
                    const spent = spendMap[category] || 0;
                    const isClipping = spent > limit;
                    
                    return (
                        <div key={category} className="group">
                        <div className="flex justify-between items-end mb-1 text-sm font-bold">
                            <span className="uppercase text-white tracking-wider group-hover:text-y2k-pink transition-colors">{category}</span>
                            <span className={isClipping ? 'text-red-500 blink text-base' : 'text-y2k-green text-base'}>
                                ${spent} <span className="text-y2k-silver text-xs">/ ${limit}</span>
                            </span>
                        </div>
                        {renderBar(spent, limit)}
                        </div>
                    );
                })
            )}
        </div>
    </div>
  );
};

export default CategoryBudgetList;
