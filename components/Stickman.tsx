
import React, { useState, useEffect } from 'react';
import { Expense, BudgetState } from '../types';
import { Cpu, Sparkles } from 'lucide-react';

interface BitBuddyProps {
  expenses: Expense[];
  budgets: BudgetState;
  insight?: string;
}

type Mood = 'happy' | 'worried' | 'dead' | 'rich' | 'idle' | 'rare_alien';

const BitBuddy: React.FC<BitBuddyProps> = ({ expenses, budgets, insight }) => {
  const [mood, setMood] = useState<Mood>('idle');
  const [speech, setSpeech] = useState<string>("SYSTEM READY");
  const [isRare, setIsRare] = useState(false);

  // Easter Egg Check on Mount
  useEffect(() => {
      // 5% chance to spawn the rare alien
      const roll = Math.random();
      if (roll < 0.05) {
          setIsRare(true);
          setSpeech("⍙⟒ ⏃⍀⟒ ⍙⏃⏁☊⊑⟟⋏☌"); // "WE ARE WATCHING" in alien text
      }
  }, []);

  // Update speech from Gemini insight
  useEffect(() => {
    if (insight) {
        setSpeech(insight);
        return;
    }
  }, [insight]);

  // "Alive" Idle Chatter
  useEffect(() => {
    // Only chat if not rare mode, not in a critical error state, and no current AI insight
    if (!insight && !isRare && mood !== 'dead' && mood !== 'worried') {
        const phrases = [
            "SYSTEM READY",
            "SCANNING SECTORS...",
            "AWAITING INPUT",
            "MONITORING FLUX...",
            "DATA OPTIMAL",
            "I SEE YOU",
            "ECO-MODE ACTIVE",
            "01001000 01001001"
        ];
        
        const interval = setInterval(() => {
             setSpeech(phrases[Math.floor(Math.random() * phrases.length)]);
        }, 4000); // Change every 4 seconds

        return () => clearInterval(interval);
    }
  }, [insight, isRare, mood]);

  useEffect(() => {
    // If rare mode is active, override standard mood logic
    if (isRare) {
        setMood('rare_alien');
        return;
    }

    const checkStatus = () => {
        const now = new Date();
        const currentExpenses = expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === now.getMonth();
        });
        const totalSpent = currentExpenses.reduce((acc, curr) => acc + curr.amount, 0);

        if (budgets.total > 0) {
            const ratio = totalSpent / budgets.total;
            if (ratio > 1.0) {
                setMood('dead');
                if (!insight) setSpeech("CRITICAL ERROR: BUDGET EXCEEDED");
            } else if (ratio > 0.8) {
                setMood('worried');
                if (!insight) setSpeech("WARNING: CAPACITY LOW");
            } else if (ratio < 0.3 && totalSpent > 0) {
                setMood('rich');
            } else {
                setMood('happy');
            }
        } else {
            setMood('idle');
        }
    };
    checkStatus();
  }, [expenses, budgets, insight, isRare]);

  // Pixel Art Renderers
  const renderAvatar = () => {
      const green = "#39ff14";
      const black = "#000000";
      
      const BaseBody = (
          <rect x="20" y="20" width="60" height="60" fill={green} className="animate-float" />
      );

      switch (mood) {
          case 'rare_alien':
               return (
                   <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_#00ffff]">
                        {/* Alien Head */}
                        <path d="M20 20 Q50 -10 80 20 Q90 50 50 90 Q10 50 20 20" fill="#00ffff" className="animate-float" />
                        {/* Eyes */}
                        <ellipse cx="35" cy="45" rx="12" ry="8" fill="black" transform="rotate(-15 35 45)" className="animate-pulse" />
                        <ellipse cx="65" cy="45" rx="12" ry="8" fill="black" transform="rotate(15 65 45)" className="animate-pulse" />
                        {/* Pupils */}
                        <circle cx="35" cy="45" r="2" fill="white" />
                        <circle cx="65" cy="45" r="2" fill="white" />
                        
                        {/* Antennae */}
                        <line x1="50" y1="10" x2="30" y2="-10" stroke="#00ffff" strokeWidth="2" />
                        <circle cx="30" cy="-10" r="3" fill="#ff00ff" className="animate-ping" />
                   </svg>
               );
          case 'dead':
              return (
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]">
                      {BaseBody}
                      <path d="M30 35 L45 50 M45 35 L30 50" stroke={black} strokeWidth="4" className="animate-float" />
                      <path d="M55 35 L70 50 M70 35 L55 50" stroke={black} strokeWidth="4" className="animate-float" />
                      <rect x="30" y="65" width="40" height="4" fill={black} className="animate-float" />
                  </svg>
              );
          case 'worried':
              return (
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]">
                      {BaseBody}
                      <rect x="30" y="40" width="10" height="10" fill={black} className="animate-float" />
                      <rect x="60" y="40" width="10" height="10" fill={black} className="animate-float" />
                      <path d="M85 30 Q90 40 85 50 Q80 40 85 30" fill="#00ffff" className="animate-pulse" />
                      <path d="M30 65 Q40 70 50 65 T70 65" stroke={black} strokeWidth="3" fill="none" className="animate-float" />
                  </svg>
              );
          case 'rich':
               return (
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]">
                      {BaseBody}
                      <rect x="25" y="35" width="20" height="12" fill={black} className="animate-float" />
                      <rect x="55" y="35" width="20" height="12" fill={black} className="animate-float" />
                      <line x1="45" y1="40" x2="55" y2="40" stroke={black} strokeWidth="2" className="animate-float" />
                      <path d="M35 65 Q50 75 65 65" stroke={black} strokeWidth="3" fill="none" className="animate-float" />
                      <text x="85" y="30" fontFamily="monospace" fontSize="20" fill="#ffff00" className="animate-bounce">$</text>
                  </svg>
               );
          default: // Happy/Idle
              return (
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]">
                      {BaseBody}
                      <rect x="30" y="35" width="10" height="10" fill={black} className="animate-float" />
                      <rect x="60" y="35" width="10" height="10" fill={black} className="animate-float" />
                      <rect x="30" y="60" width="40" height="5" fill={black} className="animate-float" />
                      <rect x="30" y="55" width="5" height="5" fill={black} className="animate-float" />
                      <rect x="65" y="55" width="5" height="5" fill={black} className="animate-float" />
                  </svg>
              );
      }
  }

  return (
    <div className="bg-y2k-gray border-2 border-y2k-green p-4 flex flex-row items-center gap-6 h-36 w-full relative overflow-hidden group shadow-[4px_4px_0px_rgba(57,255,20,0.2)] hover:shadow-[4px_4px_0px_rgba(57,255,20,0.4)] transition-all duration-300">
        {/* Scanlines specific to this container */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 pointer-events-none bg-[length:100%_2px,3px_100%]"></div>
        
        {/* Animated background decoration */}
        <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-20">
             <div className="w-8 h-1 bg-y2k-green animate-pulse"></div>
             <div className="w-6 h-1 bg-y2k-green animate-pulse delay-75"></div>
             <div className="w-4 h-1 bg-y2k-green animate-pulse delay-150"></div>
        </div>

        <div className="w-28 h-28 flex-shrink-0 relative z-20 transition-transform group-hover:scale-110 duration-300">
            {renderAvatar()}
        </div>

        <div className="flex-1 relative z-20">
            <div className={`border-2 ${isRare ? 'border-y2k-cyan bg-black/90' : 'border-y2k-green bg-black/90'} p-3 relative shadow-[4px_4px_0px_currentColor]`}>
                {/* Speech bubble tail */}
                <div className={`absolute top-1/2 -left-2 w-3 h-3 bg-black border-l-2 border-b-2 ${isRare ? 'border-y2k-cyan' : 'border-y2k-green'} transform rotate-45`}></div>
                
                <p className={`${isRare ? 'text-y2k-cyan font-display' : 'text-y2k-green'} text-sm md:text-base leading-tight uppercase animate-pulse tracking-wider font-bold text-glow break-words`}>
                    {speech}
                </p>
            </div>
            <div className="mt-2 flex justify-between items-center text-xs font-bold text-y2k-silver tracking-widest">
                <div className="flex gap-2 items-center">
                    <span>MOOD: {mood.toUpperCase()}</span>
                    {isRare && <Sparkles className="w-3 h-3 text-y2k-pink animate-spin" />}
                </div>
                <div className="flex items-center gap-1 text-y2k-green/60">
                    <Cpu className="w-3 h-3 animate-spin-slow" />
                    <span>CPU: {Math.floor(Math.random() * 30) + 10}%</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default BitBuddy;
