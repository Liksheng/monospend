
import React from 'react';
import { Expense, CATEGORY_COLORS } from '../types';
import { Trash2, XSquare, MoreVertical } from 'lucide-react';

interface TransactionListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  soloCategory: string | null;
  onToggleSolo: (category: string) => void;
  mutedCategories: Set<string>;
  onToggleMute: (category: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  expenses, onDelete, soloCategory, onToggleSolo, mutedCategories, onToggleMute 
}) => {
  
  const displayedExpenses = expenses.filter(e => {
      if (soloCategory) return e.category === soloCategory;
      if (mutedCategories.has(e.category)) return false;
      return true;
  });

  const sorted = [...displayedExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (expenses.length === 0) return <div className="text-center py-12 text-y2k-green font-mono text-lg animate-pulse font-bold tracking-widest border-y border-y2k-green/20">_NO_RECORDS_FOUND_</div>;

  return (
    <div className="font-mono text-base overflow-x-auto pb-2">
        <table className="w-full text-left border-collapse table-fixed">
            <thead>
                <tr className="border-b-2 border-y2k-green text-y2k-green tracking-wider bg-y2k-green/10">
                    <th className="p-2 uppercase font-bold text-xs md:text-sm w-12 md:w-16">ID</th>
                    <th className="p-2 uppercase font-bold text-xs md:text-sm w-auto">Desc</th>
                    <th className="p-2 uppercase font-bold text-xs md:text-sm w-20 md:w-24">Cat</th>
                    <th className="p-2 uppercase font-bold text-xs md:text-sm w-24 md:w-28">Date</th>
                    <th className="p-2 uppercase font-bold text-right text-xs md:text-sm w-20 md:w-24">Amt</th>
                    <th className="p-2 w-12 md:w-16"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-y2k-green/20">
                {sorted.map((expense, i) => {
                    const color = CATEGORY_COLORS[expense.category] || '#39ff14';
                    
                    return (
                        <tr key={expense.id} className="hover:bg-y2k-green/5 transition-colors group relative align-top">
                            <td className="p-2 text-y2k-silver font-bold text-xs font-mono whitespace-nowrap">
                                <span className="opacity-50">#</span>{(i + 1).toString().padStart(3, '0')}
                            </td>
                            {/* Description Cell with Scroll */}
                            <td className="p-2 text-white font-medium tracking-wide text-sm md:text-base">
                                <div className="overflow-x-auto whitespace-nowrap max-w-[120px] md:max-w-[250px] custom-scrollbar pb-1" title={expense.description}>
                                    {expense.description}
                                </div>
                            </td>
                            <td className="p-2 whitespace-nowrap">
                                <span 
                                    className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest inline-block border"
                                    style={{ color: color, borderColor: color, backgroundColor: `${color}10` }}
                                >
                                    {expense.category}
                                </span>
                            </td>
                            <td className="p-2 text-y2k-silver text-xs md:text-sm opacity-80 whitespace-nowrap">{expense.date}</td>
                            <td className="p-2 text-right text-y2k-cyan font-bold text-base md:text-lg whitespace-nowrap">
                                ${expense.amount.toFixed(2)}
                            </td>
                            <td className="p-2 text-right whitespace-nowrap">
                                <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => onToggleSolo(expense.category)}
                                        className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold border ${soloCategory === expense.category ? 'bg-y2k-cyan text-black border-y2k-cyan' : 'border-y2k-cyan text-y2k-cyan'}`}
                                        title="SOLO_VIEW"
                                    >S</button>
                                    <button 
                                        onClick={() => onDelete(expense.id)}
                                        className="text-y2k-pink hover:bg-y2k-pink hover:text-black p-1 border border-y2k-pink/50 hover:border-y2k-pink transition-colors"
                                        title="DELETE_RECORD"
                                    >
                                        <XSquare className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
  );
};

export default TransactionList;
