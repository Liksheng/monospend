
import React, { useState } from 'react';
import { Subscription } from '../types';
import { Plus, Trash2, Zap } from 'lucide-react';

interface SubscriptionManagerProps {
  subscriptions: Subscription[];
  onAdd: (sub: Subscription) => void;
  onDelete: (id: string) => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ subscriptions, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCost, setNewCost] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'yearly'>('monthly');

  const annualCost = subscriptions.reduce((acc, sub) => {
      return acc + (sub.frequency === 'monthly' ? sub.cost * 12 : sub.cost);
  }, 0);

  const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newName || !newCost) return;

      onAdd({
          id: Date.now().toString(),
          name: newName,
          cost: parseFloat(newCost),
          frequency,
          billingDate: '1' // Default 1st of month
      });
      setNewName('');
      setNewCost('');
      setIsAdding(false);
  };

  return (
    <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-2 border-b border-y2k-green/20 pb-1">
             <div className="flex items-center gap-1 text-xs font-bold text-y2k-green uppercase">
                <Zap className="w-3 h-3" />
                <span>Sub_Manager</span>
             </div>
             <button onClick={() => setIsAdding(!isAdding)} className="text-y2k-cyan hover:text-white">
                <Plus className="w-4 h-4" />
             </button>
        </div>

        {isAdding && (
            <form onSubmit={handleAdd} className="mb-2 bg-zinc-900 p-2 border border-y2k-cyan/50 animate-scan">
                <input 
                    placeholder="Service Name" 
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full bg-black border border-zinc-700 text-xs p-1 text-white mb-1 focus:border-y2k-cyan outline-none"
                    autoFocus
                />
                <div className="flex gap-1">
                    <input 
                        type="number" 
                        placeholder="Cost" 
                        value={newCost}
                        onChange={e => setNewCost(e.target.value)}
                        className="flex-1 bg-black border border-zinc-700 text-xs p-1 text-white focus:border-y2k-cyan outline-none"
                    />
                    <select 
                        value={frequency} 
                        onChange={(e) => setFrequency(e.target.value as any)}
                        className="bg-black border border-zinc-700 text-white text-[10px]"
                    >
                        <option value="monthly">/mo</option>
                        <option value="yearly">/yr</option>
                    </select>
                    <button type="submit" className="bg-y2k-cyan text-black px-2 font-bold text-xs hover:bg-white">+</button>
                </div>
            </form>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
            {subscriptions.length === 0 && !isAdding && (
                <div className="text-center text-[10px] text-zinc-600 py-4">NO_SUBSCRIPTIONS_DETECTED</div>
            )}
            {subscriptions.map(sub => (
                <div key={sub.id} className="flex justify-between items-center p-1 hover:bg-white/5 group border-b border-dashed border-zinc-800">
                    <div className="flex flex-col">
                        <span className="text-xs text-white font-bold">{sub.name}</span>
                        <span className="text-[9px] text-zinc-500 uppercase">{sub.frequency}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-y2k-cyan font-mono">${sub.cost}</span>
                        <button onClick={() => onDelete(sub.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-2 pt-2 border-t border-y2k-green/30 text-right">
            <span className="text-[9px] text-zinc-400 uppercase mr-2">Projected Annual Drain:</span>
            <span className="text-sm font-bold text-red-400 font-mono">${annualCost.toFixed(2)}</span>
        </div>
    </div>
  );
};

export default SubscriptionManager;
