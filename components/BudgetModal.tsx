
import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Category, BudgetState } from '../types';
import RotaryKnob from './RotaryKnob';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: BudgetState;
  onSave: (budget: BudgetState) => void;
}

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, currentBudget, onSave }) => {
  const [localBudget, setLocalBudget] = useState<BudgetState>(currentBudget);

  useEffect(() => {
    setLocalBudget({
      income: currentBudget.income || 0,
      total: currentBudget.total || 0,
      categories: currentBudget.categories || {}
    });
  }, [currentBudget, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (category: string, value: number) => {
    setLocalBudget(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: value
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localBudget);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-blue-900 border-4 border-double border-white text-white shadow-[0_0_50px_rgba(0,0,255,0.3)] flex flex-col max-h-[90vh] font-mono transform scale-100 transition-transform">
        
        {/* BIOS Header */}
        <div className="bg-gray-300 text-blue-900 px-2 py-1 text-center font-bold uppercase tracking-widest shadow-md flex justify-between items-center">
            <span>Setup Utility - {new Date().getFullYear()}</span>
            <span className="text-[10px] opacity-50">v1.0</span>
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-b border-white/50 bg-blue-800/50">
          <h2 className="text-yellow-300 font-bold text-shadow-sm">&gt;&gt; SYSTEM_CONFIG_MENU</h2>
          <button onClick={onClose} className="text-white hover:text-red-500 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Master Section */}
            <div className="border border-white p-4 relative group hover:bg-white/5 transition-colors">
                <div className="absolute -top-3 left-2 bg-blue-900 px-2 text-yellow-300 text-xs font-bold group-hover:text-white transition-colors">MASTER_CONTROLS</div>
                <div className="flex justify-around items-center h-full py-4 gap-4">
                     <div className="flex flex-col items-center">
                        <label className="mb-2 text-cyan-300 font-bold text-sm">INCOME</label>
                        <input 
                            type="number" 
                            step="10"
                            value={localBudget.income} 
                            onChange={(e) => setLocalBudget({...localBudget, income: parseInt(e.target.value) || 0})}
                            className="bg-blue-800 border border-white text-white p-2 w-32 text-center focus:bg-blue-700 focus:outline-none focus:border-yellow-300 transition-all shadow-inner"
                        />
                     </div>
                     <div className="flex flex-col items-center">
                        <label className="mb-2 text-cyan-300 font-bold text-sm">LIMIT</label>
                         <input 
                            type="number" 
                            step="10"
                            value={localBudget.total} 
                            onChange={(e) => setLocalBudget({...localBudget, total: parseInt(e.target.value) || 0})}
                            className="bg-blue-800 border border-white text-white p-2 w-32 text-center focus:bg-blue-700 focus:outline-none focus:border-yellow-300 transition-all shadow-inner"
                        />
                     </div>
                </div>
            </div>

            {/* Channels */}
            <div className="border border-white p-4 relative group hover:bg-white/5 transition-colors">
                <div className="absolute -top-3 left-2 bg-blue-900 px-2 text-yellow-300 text-xs font-bold group-hover:text-white transition-colors">ALLOCATION_TABLE</div>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 pt-2">
                    {Object.values(Category).map((cat) => (
                        <div key={cat} className="flex justify-between items-center border-b border-white/20 pb-1 hover:border-cyan-300 transition-colors">
                             <span className="text-xs font-bold tracking-wider">{cat}</span>
                             <input 
                                type="number"
                                step="10"
                                value={localBudget.categories[cat] || 0}
                                onChange={(e) => handleCategoryChange(cat, parseInt(e.target.value) || 0)}
                                className="bg-transparent text-right w-20 focus:bg-blue-800 outline-none text-yellow-300 font-bold"
                             />
                        </div>
                    ))}
                </div>
            </div>

        </form>

        {/* BIOS Footer */}
        <div className="p-2 border-t border-white bg-blue-800 flex justify-between text-xs items-center">
             <div className="space-x-4 font-bold opacity-80">
                <span>F1: Help</span>
                <span>ESC: Exit</span>
             </div>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-gray-300 text-blue-900 font-bold uppercase hover:bg-white hover:scale-105 transition-all flex items-center gap-2 shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-none"
            >
              <Save className="w-4 h-4" />
              F10: Save & Exit
            </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetModal;
