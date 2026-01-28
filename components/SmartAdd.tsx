
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { parseNaturalLanguageExpense } from '../services/geminiService';
import { playTypingSound, playGlitchSound, playSuccessSound } from '../services/audioService';
import { Expense, WishlistItem, SmartParseResult } from '../types';
import { Loader2, EyeOff, Send, Terminal, AlertTriangle } from 'lucide-react';
import OpticalIngest from './OpticalIngest';

interface SmartAddProps {
  onAddExpense: (expense: Expense) => void;
  onAddWishlistItem: (item: WishlistItem) => void;
  expenses: Expense[]; // Passed for Anomaly Detection
}

const SmartAdd: React.FC<SmartAddProps> = ({ onAddExpense, onAddWishlistItem, expenses }) => {
  const [input, setInput] = useState('');
  const [excludeStats, setExcludeStats] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  
  // Anomaly State
  const [pendingExpense, setPendingExpense] = useState<Expense | null>(null);
  const [anomalyWarning, setAnomalyWarning] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
      if (Math.random() > 0.5) playTypingSound();
  };

  const processParseResults = (results: SmartParseResult[]) => {
        let count = 0;
        
        results.forEach(result => {
            if (result.type === 'wishlist') {
                 const newItem: WishlistItem = {
                     id: Date.now().toString() + Math.random(),
                     name: result.description,
                     cost: result.amount
                 };
                 onAddWishlistItem(newItem);
                 count++;
            } else {
                 const newExpense: Expense = {
                    id: typeof crypto !== 'undefined' && crypto.randomUUID 
                            ? crypto.randomUUID() 
                            : Math.random().toString(36).substring(2) + Date.now().toString(36),
                    amount: result.amount,
                    category: result.category || 'Other',
                    description: result.description,
                    date: result.date || new Date().toISOString().split('T')[0],
                    excludeFromStats: excludeStats
                };

                // Anomaly Detection Logic
                const catExpenses = expenses.filter(e => e.category === newExpense.category);
                if (catExpenses.length > 5) {
                    const total = catExpenses.reduce((sum, e) => sum + e.amount, 0);
                    const avg = total / catExpenses.length;
                    
                    // Trigger if > 3x average
                    if (newExpense.amount > avg * 3 && newExpense.amount > 50) {
                        setPendingExpense(newExpense);
                        setAnomalyWarning(`ALERT: $${newExpense.amount} is significantly higher than your average ${newExpense.category} spend ($${avg.toFixed(0)}).`);
                        playGlitchSound();
                        return; // Stop processing to show modal
                    }
                }
                
                onAddExpense(newExpense);
                count++;
            }
        });

        if (!pendingExpense) {
            setStatusMsg(`>> SUCCESS: ${count} ITEMS LOGGED`);
            playSuccessSound();
            setInput('');
            setExcludeStats(false);
        }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsProcessing(true);
    setStatusMsg("PARSING_DATA_STREAM...");

    try {
      const results = await parseNaturalLanguageExpense(input);
      
      if (results && results.length > 0) {
          processParseResults(results);
      } else {
        setStatusMsg(">> ERR: SYNTAX INVALID");
        playGlitchSound();
      }
    } catch (error) {
      setStatusMsg(">> SYSTEM FAILURE");
      playGlitchSound();
    } finally {
      setIsProcessing(false);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const confirmAnomaly = (allow: boolean) => {
      if (allow && pendingExpense) {
          onAddExpense(pendingExpense);
          playSuccessSound();
          setStatusMsg(">> OVERRIDE AUTHORIZED");
          setInput('');
      } else {
          setStatusMsg(">> ANOMALY REJECTED");
      }
      setPendingExpense(null);
      setAnomalyWarning(null);
      setTimeout(() => setStatusMsg(null), 3000);
  }

  return createPortal(
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-y2k-green p-2 md:p-4 z-[60] shadow-[0_-5px_20px_rgba(57,255,20,0.15)]">
      {/* Anomaly Modal */}
      {anomalyWarning && (
          <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-glitch">
              <div className="border-2 border-red-500 bg-black p-6 max-w-md w-full shadow-[0_0_20px_red] relative">
                  <div className="absolute -top-3 -left-2 bg-red-500 text-black px-2 font-bold uppercase">Security_Alert</div>
                  <div className="flex items-start gap-4 mb-4">
                      <AlertTriangle className="w-10 h-10 text-red-500 animate-pulse shrink-0" />
                      <div>
                          <h3 className="text-red-500 font-bold text-lg mb-1">ABNORMAL SPEND DETECTED</h3>
                          <p className="text-white text-sm font-mono">{anomalyWarning}</p>
                      </div>
                  </div>
                  <div className="flex gap-4">
                      <button onClick={() => confirmAnomaly(true)} className="flex-1 bg-red-500 text-black font-bold py-2 hover:bg-white hover:text-red-500 transition-colors">
                          CONFIRM
                      </button>
                      <button onClick={() => confirmAnomaly(false)} className="flex-1 border border-red-500 text-red-500 font-bold py-2 hover:bg-red-500/20 transition-colors">
                          REJECT
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col gap-2">
          
          {/* Status Line */}
          <div className="flex justify-between items-end px-1">
              <div className="text-xs font-mono text-y2k-green/70 flex items-center gap-2">
                  <Terminal className="w-3 h-3" />
                  <span className="animate-pulse">{statusMsg || ">_ CMD_LINE_INPUT"}</span>
              </div>
              {statusMsg && (
                  <div className="h-1 flex-1 mx-4 bg-y2k-green/20 overflow-hidden">
                       <div className="h-full bg-y2k-green w-1/3 animate-marquee"></div>
                  </div>
              )}
              <span className="text-[9px] text-y2k-green/40 hidden md:block">SECURE_CHANNEL_ESTABLISHED</span>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="flex gap-2 md:gap-4 h-12 md:h-14 relative group">
              <div className="relative flex-1 flex items-center">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-y2k-green animate-pulse"></div>
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="> Ex: 'Lunch $15' OR 'Wishlist Bike $200'"
                    className="w-full h-full bg-black border-2 border-y2k-green pl-6 pr-4 text-lg md:text-xl font-bold text-white placeholder-y2k-green/30 focus:outline-none focus:bg-y2k-green/5 focus:shadow-[0_0_15px_rgba(57,255,20,0.2)] transition-all font-mono"
                    disabled={isProcessing}
                    autoFocus
                  />
                  {/* Glitch decoration on focus */}
                  <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-y2k-green opacity-0 group-focus-within:opacity-100"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-y2k-green opacity-0 group-focus-within:opacity-100"></div>
              </div>

              {/* Controls */}
              <div className="flex gap-2 shrink-0">
                  <OpticalIngest onScanComplete={(res) => processParseResults([res])} />

                  <button
                    type="button"
                    onClick={() => setExcludeStats(!excludeStats)}
                    className={`w-14 md:w-16 border-2 flex items-center justify-center transition-all ${excludeStats ? 'border-y2k-pink text-y2k-pink bg-y2k-pink/10 shadow-[0_0_10px_#ff00ff]' : 'border-y2k-green text-y2k-green hover:bg-y2k-green hover:text-black'}`}
                    title="Toggle Ghost Mode (Exclude from Stats)"
                  >
                      <EyeOff className="w-6 h-6" />
                  </button>

                  <button
                    type="submit"
                    disabled={!input.trim() || isProcessing}
                    className="w-16 md:w-20 bg-y2k-green text-black font-bold border-2 border-y2k-green hover:bg-white hover:text-black hover:border-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                  >
                      {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                  </button>
              </div>
          </form>
      </div>
    </div>,
    document.body
  );
};

export default SmartAdd;
