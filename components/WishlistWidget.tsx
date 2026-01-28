
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, X } from 'lucide-react';
import { WishlistItem } from '../types';

interface WishlistWidgetProps {
  savedAmount: number; 
}

const WishlistWidget: React.FC<WishlistWidgetProps> = ({ savedAmount }) => {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('monospend_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [isAdding, setIsAdding] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualCost, setManualCost] = useState('');

  useEffect(() => {
      const handleExternalAdd = (e: CustomEvent) => {
          setItems(prev => [...prev, e.detail]);
      };
      window.addEventListener('monospend-add-wishlist' as any, handleExternalAdd as any);
      return () => window.removeEventListener('monospend-add-wishlist' as any, handleExternalAdd as any);
  }, []);

  useEffect(() => {
    localStorage.setItem('monospend_wishlist', JSON.stringify(items));
  }, [items]);

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleManualAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if (manualName && manualCost) {
          const newItem: WishlistItem = {
              id: Date.now().toString(),
              name: manualName,
              cost: parseFloat(manualCost)
          };
          setItems(prev => [...prev, newItem]);
          setManualName('');
          setManualCost('');
          setIsAdding(false);
      }
  };

  let remainingSavings = Math.max(0, savedAmount);

  return (
    <div className="h-full flex flex-col">
         {/* Header with Add Button */}
         <div className="flex justify-between items-center mb-3">
            <div className="bg-y2k-green text-black text-xs px-2 font-bold inline-block uppercase border border-y2k-green w-fit">NEW_EXPANSION (Wishlist)</div>
            <button 
                onClick={() => setIsAdding(!isAdding)}
                className="text-y2k-green hover:text-white transition-colors"
                title="Manually Add Item"
            >
                {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
        </div>
        
        {isAdding && (
            <form onSubmit={handleManualAdd} className="mb-2 border border-dashed border-y2k-green/50 p-2 bg-black/50 animate-scan">
                <input 
                    className="w-full bg-transparent border-b border-y2k-green/30 mb-2 text-xs text-white outline-none placeholder-zinc-600"
                    placeholder="ITEM NAME"
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                    autoFocus
                />
                <div className="flex gap-2">
                    <input 
                        type="number"
                        className="flex-1 bg-transparent border-b border-y2k-green/30 text-xs text-white outline-none placeholder-zinc-600"
                        placeholder="COST"
                        value={manualCost}
                        onChange={e => setManualCost(e.target.value)}
                    />
                    <button type="submit" className="text-xs bg-y2k-green text-black px-2 font-bold uppercase hover:bg-white">+</button>
                </div>
            </form>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
           {items.length === 0 && !isAdding ? (
               <div className="h-full flex flex-col items-center justify-center text-y2k-green/50">
                   <p className="text-xs font-mono">DIR EMPTY</p>
               </div>
           ) : (
               <>
                    {items.map(item => {
                        const progressAmount = Math.min(remainingSavings, item.cost);
                        const percent = Math.min((progressAmount / item.cost) * 100, 100);
                        remainingSavings -= progressAmount;
                        const isFunded = percent >= 100;

                        return (
                            <div key={item.id} className={`p-1 border ${isFunded ? 'border-y2k-pink bg-y2k-pink/10' : 'border-y2k-green bg-black'} relative group`}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className={`text-xs uppercase font-bold ${isFunded ? 'text-y2k-pink' : 'text-y2k-green'}`}>{item.name}</span>
                                    <span className="text-xs font-mono text-white">${item.cost}</span>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="h-2 w-full bg-gray-800 relative border border-gray-600">
                                    <div className={`h-full absolute top-0 left-0 ${isFunded ? 'bg-y2k-pink' : 'bg-y2k-green'}`} style={{ width: `${percent}%` }}></div>
                                </div>

                                <button onClick={() => handleDelete(item.id)} className="absolute -top-2 -right-2 bg-black border border-y2k-green text-y2k-green p-1 hover:bg-y2k-pink hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        );
                    })}
               </>
           )}
        </div>
    </div>
  );
};

export default WishlistWidget;
