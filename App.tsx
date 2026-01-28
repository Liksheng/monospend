
import React, { useState, useEffect, useMemo } from 'react';
import SmartAdd from './components/SmartAdd';
import { CategoryPieChart, DailyBarChart } from './components/Charts';
import TransactionList from './components/TransactionList';
import BudgetModal from './components/BudgetModal';
import CategoryBudgetList from './components/CategoryBudgetList';
import MasterFader from './components/MasterFader';
import WishlistWidget from './components/WishlistWidget';
import BitBuddy from './components/Stickman'; 
import DataControls from './components/DataControls';
import HullIntegrity from './components/HullIntegrity';
import SubscriptionManager from './components/SubscriptionManager';
import PredictiveModelling from './components/PredictiveModelling';
import CalendarWidget from './components/CalendarWidget';

import { Expense, BudgetState, WishlistItem, Subscription } from './types';
import { getSpendingInsights } from './services/geminiService';
import { Settings, Minimize2, X, Maximize2, Calculator, Activity, Server, Filter, Terminal } from 'lucide-react';

function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem('monospend_expenses');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [budgets, setBudgets] = useState<BudgetState>(() => {
    try {
      const saved = localStorage.getItem('monospend_budgets');
      const parsed = saved ? JSON.parse(saved) : {};
      return {
        income: parsed.income || 0,
        total: parsed.total || 0,
        categories: parsed.categories || {}
      };
    } catch { return { income: 0, total: 0, categories: {} }; }
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
      try {
          const saved = localStorage.getItem('monospend_subscriptions');
          return saved ? JSON.parse(saved) : [];
      } catch { return []; }
  });

  const [insight, setInsight] = useState("");
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [soloCategory, setSoloCategory] = useState<string | null>(null);
  const [mutedCategories, setMutedCategories] = useState<Set<string>>(new Set());
  const [dateRange, setDateRange] = useState<{start: string, end: string} | null>(null);
  const [bootSequence, setBootSequence] = useState(true);
  const [marqueeMessage, setMarqueeMessage] = useState(">>> SYSTEM INITIALIZED >>> WAITING FOR INPUT >>> CHECK BUDGET LEVELS >>> MAXIMIZE EFFICIENCY >>>");

  useEffect(() => {
      const timer = setTimeout(() => setBootSequence(false), 2500);
      return () => clearTimeout(timer);
  }, []);

  // Marquee Easter Egg
  useEffect(() => {
    const interval = setInterval(() => {
        // 1% chance to glitch every 5 seconds
        if (Math.random() < 0.01) {
            const messages = [
                ">>> ⍙⟒ ⏃⍀⟒ ⍙⏃⏁☊⊑⟟⋏☌ >>>",
                ">>> WAKE UP NEO >>>",
                ">>> GHOST_IN_THE_SHELL DETECTED >>>",
                ">>> SYSTEM COMPROMISED >>> RELOADING REALITY >>>",
                ">>> 01001000 01000101 01001100 01010000 >>>"
            ];
            const glitchMsg = messages[Math.floor(Math.random() * messages.length)];
            setMarqueeMessage(glitchMsg);
            
            // Reset after 4 seconds
            setTimeout(() => {
                setMarqueeMessage(">>> SYSTEM INITIALIZED >>> WAITING FOR INPUT >>> CHECK BUDGET LEVELS >>> MAXIMIZE EFFICIENCY >>>");
            }, 4000);
        }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { localStorage.setItem('monospend_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('monospend_budgets', JSON.stringify(budgets)); }, [budgets]);
  useEffect(() => { localStorage.setItem('monospend_subscriptions', JSON.stringify(subscriptions)); }, [subscriptions]);

  useEffect(() => {
    if (expenses.length > 0 && !insight) {
        getSpendingInsights(expenses, budgets.total, budgets.income).then(setInsight);
    }
  }, [expenses.length, insight, budgets.total, budgets.income]);

  const currentMonthTotal = useMemo(() => {
    const now = new Date();
    return expenses
      .filter(e => new Date(e.date).getMonth() === now.getMonth())
      .reduce((acc, curr) => acc + curr.amount, 0);
  }, [expenses]);
  
  // Calculate reserves (Income - Spending - Subscriptions share)
  const currentReserves = useMemo(() => {
      const subCost = subscriptions.reduce((acc, sub) => {
        // Monthly equivalent
        return acc + (sub.frequency === 'monthly' ? sub.cost : sub.cost / 12);
      }, 0);
      return budgets.income - currentMonthTotal - subCost;
  }, [budgets.income, currentMonthTotal, subscriptions]);

  const remaining = budgets.total - currentMonthTotal;

  const dailyAllowance = useMemo(() => {
      if (budgets.total <= 0) return 0;
      const now = new Date();
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const daysRemaining = Math.max(1, lastDay.getDate() - now.getDate());
      return Math.max(0, remaining / daysRemaining);
  }, [remaining, budgets.total]);

  const handleToggleSolo = (cat: string) => {
      setSoloCategory(prev => prev === cat ? null : cat);
  };

  const handleToggleMute = (cat: string) => {
      setMutedCategories(prev => {
          const next = new Set(prev);
          if (next.has(cat)) next.delete(cat);
          else next.add(cat);
          return next;
      });
  };

  const handleAddWishlistItem = (item: WishlistItem) => {
      window.dispatchEvent(new CustomEvent('monospend-add-wishlist', { detail: item }));
  };

  // Filter expenses for the Log view based on Calendar Selection
  const filteredLogExpenses = useMemo(() => {
    let data = expenses;
    if (dateRange) {
        data = data.filter(e => e.date >= dateRange.start && e.date <= dateRange.end);
    }
    return data;
  }, [expenses, dateRange]);

  if (bootSequence) {
      return (
          <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center font-mono text-y2k-green p-8">
              <div className="max-w-md w-full space-y-2">
                  <div className="text-xs animate-pulse"> BIOS DATE: 01/01/2000 00:00:01</div>
                  <div className="border-b border-y2k-green pb-2 mb-4">MONOSPEND_OS KERNEL LOADING...</div>
                  <div className="space-y-1 text-xs opacity-80">
  <div className="flex justify-between"><span>&gt; MOUNTING VOLUMES</span><span>[OK]</span></div>
<div className="flex justify-between delay-100"><span>&gt; LOADING NEURAL ENGINE</span><span>[OK]</span></div>
<div className="flex justify-between delay-200"><span>&gt; CHECKING HULL INTEGRITY</span><span>[OK]</span></div>
<div className="flex justify-between delay-300"><span>&gt; ESTABLISHING SECURE LINK</span><span>[OK]</span></div>
<div className="flex justify-between delay-500"><span>&gt; INITIALIZING UI_2000</span><span>[LOADING]</span></div>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 mt-4 border border-zinc-700">
                      <div className="h-full bg-y2k-green animate-[width_2s_ease-in-out_forwards]" style={{width: '100%'}}></div>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen font-mono text-y2k-green selection:bg-y2k-pink selection:text-white relative overflow-x-hidden bg-[#020202]">
      
      {/* --- NEW BACKGROUND --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
          {/* Main Gradient Base */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#0a1a0a_0%,#000000_100%)]"></div>
          
          {/* Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
                backgroundImage: `
                    linear-gradient(to right, #39ff14 1px, transparent 1px),
                    linear-gradient(to bottom, #39ff14 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)'
            }}
          ></div>

          {/* Perspective Floor Grid (Pseudo 3D) */}
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-[linear-gradient(transparent_0%,#39ff14_2px,transparent_3px)] bg-[size:100%_20px] opacity-10" style={{ transform: 'perspective(500px) rotateX(60deg) scale(2)', transformOrigin: 'bottom' }}></div>
          
          {/* Floating Particles/Noise */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      </div>

      {/* Server Rack Lights Left */}
      <div className="fixed top-20 left-2 hidden xl:flex flex-col gap-2 opacity-40 pointer-events-none z-0">
           {Array.from({length: 12}).map((_, i) => (
               <div key={i} className="w-1.5 h-1.5 bg-y2k-green/50 rounded-sm" style={{animation: `blink ${Math.random() * 2 + 0.5}s infinite`}}></div>
           ))}
      </div>
      {/* Server Rack Lights Right */}
      <div className="fixed bottom-40 right-2 hidden xl:flex flex-col gap-2 opacity-40 pointer-events-none z-0">
           {Array.from({length: 12}).map((_, i) => (
               <div key={i} className="w-1.5 h-1.5 bg-y2k-pink/50 rounded-sm" style={{animation: `blink ${Math.random() * 2 + 0.5}s infinite`}}></div>
           ))}
      </div>


      {/* Main Window Container */}
      <div className="max-w-7xl mx-auto mt-2 md:mt-6 md:border-2 border-y2k-green bg-black/90 backdrop-blur-md shadow-[0_0_50px_rgba(57,255,20,0.05)] relative flex flex-col mb-[160px] z-10 animate-[fadeIn_0.5s_ease-out]">
          
          {/* Title Bar */}
          <header className="bg-y2k-green text-black p-2 flex justify-between items-center select-none border-b-2 border-black sticky top-0 z-50 shadow-lg">
              <div className="flex items-center gap-3 pl-2 group cursor-default">
                  <div className="w-3 h-3 bg-black animate-blink group-hover:bg-white transition-colors shadow-[0_0_5px_rgba(0,0,0,0.5)]"></div>
                  <h1 className="font-bold tracking-[0.3em] text-lg md:text-2xl uppercase drop-shadow-md flex items-center gap-2">
                    MONOSPEND_2000 <span className="text-[10px] bg-black text-white px-1 rounded-sm opacity-60">BETA</span>
                  </h1>
              </div>
              <div className="flex gap-1">
                  <div className="flex items-center gap-2 mr-4 text-[10px] font-bold opacity-70 hidden sm:flex">
                      <span>RAM: 64MB</span>
                      <span>|</span>
                      <span>CPU: 333MHZ</span>
                  </div>
                  <button className="w-5 h-5 border-2 border-black flex items-center justify-center hover:bg-white hover:text-black transition-colors"><Minimize2 className="w-3 h-3" /></button>
                  <button className="w-5 h-5 border-2 border-black flex items-center justify-center hover:bg-white hover:text-black transition-colors"><Maximize2 className="w-3 h-3" /></button>
                  <button className="w-5 h-5 border-2 border-black flex items-center justify-center hover:bg-y2k-pink hover:text-white transition-colors"><X className="w-3 h-3" /></button>
              </div>
          </header>

          {/* Menu Bar / Marquee */}
          <div className="border-b-2 border-y2k-green bg-zinc-900/95 flex items-center overflow-hidden whitespace-nowrap py-2 relative z-40">
              <div className="px-3 border-r border-y2k-green/30 text-sm font-bold shrink-0 text-glow flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-pulse text-y2k-pink" />
                  <span className="hidden md:inline">STATUS: ONLINE</span>
              </div>
              <div className="flex-1 overflow-hidden relative h-6 flex items-center bg-black/40 mx-2 border border-y2k-green/10 inner-shadow">
                  <div className="animate-marquee absolute whitespace-nowrap text-lg text-y2k-cyan font-bold tracking-wider text-glow">
                      {insight ? `>>> OVERSEER_AI: ${insight} <<<` : marqueeMessage}
                  </div>
              </div>
              <div className="px-3 border-l border-y2k-green/30 shrink-0 flex gap-4 items-center">
                  <div className="flex gap-1 items-center text-y2k-green/50" title="Network Status">
                      <Server className="w-4 h-4 animate-pulse" />
                      <span className="text-[10px] hidden sm:inline animate-pulse">LINK_SECURE</span>
                  </div>
                  <div className="h-4 w-px bg-y2k-green/30"></div>
                  <DataControls expenses={expenses} budgets={budgets} onImport={(e, b) => { setExpenses(e); setBudgets(b); }} />
                  <button onClick={() => setIsBudgetModalOpen(true)} title="CONFIG" className="hover:text-y2k-pink transition-colors">
                      <Settings className="w-5 h-5 hover:animate-spin-slow" />
                  </button>
              </div>
          </div>

          {/* Dashboard Grid */}
          <main className="p-3 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
              
              {/* --- LEFT COLUMN (Status & Meters) --- */}
              <div className="lg:col-span-4 space-y-6 flex flex-col">
                  
                  {/* Avatar Widget */}
                  <BitBuddy expenses={expenses} budgets={budgets} insight={insight} />
                  
                  {/* Hull Integrity (Health Bar) */}
                  <HullIntegrity income={budgets.income} totalSpent={currentMonthTotal} />

                  {/* Daily Capacity / Budget Core Panel */}
                  <div className="y2k-panel p-0 relative group flex flex-col overflow-hidden border-y2k-cyan shadow-[0_0_10px_rgba(0,255,255,0.05)] hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] transition-all">
                       {/* Header */}
                       <div className="bg-y2k-cyan/10 border-b border-y2k-cyan p-2 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-y2k-cyan">
                                <Calculator className="w-4 h-4" />
                                <span className="font-bold text-xs uppercase tracking-widest">FLUX_CAPACITY</span>
                            </div>
                            <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-y2k-cyan rounded-full animate-pulse"></div>
                                <div className="w-1.5 h-1.5 bg-y2k-cyan rounded-full animate-pulse delay-75"></div>
                            </div>
                       </div>

                       <div className="p-4 flex flex-col gap-4 relative z-10">
                            {/* Main Daily Readout */}
                            <div className="flex justify-between items-end">
                                 <div className="flex flex-col">
                                      <span className="text-[10px] text-y2k-cyan/70 uppercase font-bold mb-1 tracking-wider">SAFE_DAILY_BURN</span>
                                      <div className="text-4xl md:text-5xl font-black text-y2k-cyan text-glow font-mono leading-none tracking-tighter flex items-baseline">
                                          ${Math.floor(dailyAllowance)}
                                          <span className="text-xl opacity-60">.{dailyAllowance.toFixed(2).split('.')[1]}</span>
                                      </div>
                                 </div>
                                 <div className="text-right">
                                      <span className="text-[10px] text-y2k-cyan/70 uppercase font-bold block tracking-wider">SYS_LOAD</span>
                                      <div className="text-xl font-bold text-y2k-cyan font-mono">
                                           {budgets.total > 0 ? ((currentMonthTotal / budgets.total) * 100).toFixed(1) : "0.0"}%
                                      </div>
                                 </div>
                            </div>

                            {/* Separator */}
                            <div className="h-px bg-gradient-to-r from-transparent via-y2k-cyan/30 to-transparent"></div>

                            {/* Controls Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                 {/* Income Input */}
                                 <div className="bg-black/40 border border-y2k-cyan/30 p-2 group hover:border-y2k-cyan hover:bg-y2k-cyan/5 transition-all">
                                      <label className="text-[9px] text-y2k-cyan/70 uppercase font-bold block mb-1 group-hover:text-y2k-cyan tracking-wider">TOTAL_INCOME</label>
                                      <div className="flex items-center gap-1">
                                          <span className="text-y2k-cyan/50 text-sm font-mono">$</span>
                                          <input 
                                              type="number"
                                              step="10" 
                                              value={budgets.income}
                                              onChange={(e) => setBudgets(b => ({...b, income: parseFloat(e.target.value) || 0}))}
                                              className="bg-transparent w-full text-y2k-cyan font-mono font-bold text-lg focus:outline-none placeholder-y2k-cyan/30"
                                              placeholder="0"
                                          />
                                      </div>
                                 </div>

                                 {/* Limit Input */}
                                 <div className="bg-black/40 border border-y2k-cyan/30 p-2 group hover:border-y2k-cyan hover:bg-y2k-cyan/5 transition-all">
                                      <label className="text-[9px] text-y2k-cyan/70 uppercase font-bold block mb-1 group-hover:text-y2k-cyan tracking-wider">SPEND_LIMIT</label>
                                      <div className="flex items-center gap-1">
                                          <span className="text-y2k-cyan/50 text-sm font-mono">$</span>
                                          <input 
                                              type="number" 
                                              step="10"
                                              value={budgets.total}
                                              onChange={(e) => setBudgets(b => ({...b, total: parseFloat(e.target.value) || 0}))}
                                              className="bg-transparent w-full text-y2k-cyan font-mono font-bold text-lg focus:outline-none placeholder-y2k-cyan/30"
                                              placeholder="0"
                                          />
                                      </div>
                                 </div>
                            </div>
                            
                            {/* Projected Savings */}
                            <div className="bg-y2k-cyan/5 border border-y2k-cyan/20 p-2 flex justify-between items-center">
                                 <span className="text-[9px] text-y2k-cyan/70 uppercase font-bold tracking-wider">PROJECTED_RESERVE</span>
                                 <span className="text-y2k-cyan font-bold font-mono tracking-widest">
                                    ${(currentReserves).toFixed(2)}
                                 </span>
                            </div>
                       </div>

                       {/* Background Decoration */}
                       <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,255,255,0.02)_25%,rgba(0,255,255,0.02)_50%,transparent_50%,transparent_75%,rgba(0,255,255,0.02)_75%,rgba(0,255,255,0.02)_100%)] bg-[size:20px_20px] pointer-events-none"></div>
                  </div>

                  {/* Master Fader Panel */}
                  <div className="y2k-panel p-3 relative flex flex-col min-h-[200px]">
                      <div className="absolute top-0 right-0 p-1 opacity-50">
                        <div className="flex gap-1">
                            <div className="w-1 h-1 bg-y2k-green rounded-full animate-pulse"></div>
                            <div className="w-1 h-1 bg-y2k-green rounded-full animate-pulse delay-75"></div>
                        </div>
                      </div>
                      <div className="bg-y2k-green text-black text-xs px-2 mb-3 font-bold inline-block uppercase border border-y2k-green w-fit">Master_Fader</div>
                      
                      <div className="flex-1 flex items-center justify-center bg-black/40 border border-zinc-800 inner-shadow p-2">
                          <MasterFader income={budgets.income} totalSpent={currentMonthTotal} />
                      </div>
                  </div>
              </div>

              {/* --- RIGHT COLUMN (Lists & Data) --- */}
              <div className="lg:col-span-8 space-y-6 flex flex-col">

                  {/* Top Row: Tape Log & Calendar */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Tape Log (Transaction Table) */}
                      <div className="lg:col-span-2 y2k-panel p-4 min-h-[350px] relative flex flex-col">
                          {/* Animated Scanline Overlay */}
                          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-y2k-green/5 to-transparent h-32 animate-scan opacity-10"></div>

                          <div className="flex justify-between items-center mb-4 border-b border-y2k-green/30 pb-2">
                              <div className="bg-y2k-green text-black text-xs px-2 font-bold uppercase border border-y2k-green">Tape_Log</div>
                              <div className="flex items-center gap-3 text-xs font-bold text-y2k-silver">
                                {dateRange && (
                                    <div className="flex items-center gap-1 text-y2k-pink animate-pulse">
                                        <Filter className="w-3 h-3" />
                                        <span>RANGE_ACTIVE</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1 bg-black border border-red-900 px-2 py-0.5">
                                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                                    <span className="text-red-500 text-[10px]">REC</span>
                                </div>
                                <span className="text-y2k-green font-mono">IDX:[{filteredLogExpenses.length}]</span>
                              </div>
                          </div>
                          <div className="flex-1">
                            <TransactionList 
                                expenses={filteredLogExpenses} 
                                onDelete={(id) => setExpenses(prev => prev.filter(e => e.id !== id))}
                                soloCategory={soloCategory}
                                onToggleSolo={handleToggleSolo}
                                mutedCategories={mutedCategories}
                                onToggleMute={handleToggleMute}
                            />
                          </div>
                      </div>

                      {/* Calendar Widget */}
                      <div className="lg:col-span-1 y2k-panel p-3 flex flex-col relative h-[350px] lg:h-auto">
                          <div className="bg-y2k-green text-black text-xs px-2 mb-2 font-bold inline-block uppercase border border-y2k-green w-fit">SYS_CALENDAR</div>
                          <div className="flex-1 relative">
                               <CalendarWidget 
                                  expenses={expenses} 
                                  selectedRange={dateRange} 
                                  onSelectRange={setDateRange} 
                               />
                          </div>
                      </div>

                  </div>
                  
                  {/* Middle Row: Limiters, Wishlist, Subscription, Predictive */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Limiters */}
                      <div className="y2k-panel p-3 h-80 overflow-hidden flex flex-col relative group">
                          <CategoryBudgetList 
                              expenses={expenses} 
                              budgets={budgets} 
                              onOpenSettings={() => setIsBudgetModalOpen(true)}
                          />
                      </div>
                      
                      {/* Wishlist */}
                      <div className="y2k-panel p-3 h-80 overflow-hidden flex flex-col relative group">
                           <WishlistWidget savedAmount={currentReserves} />
                      </div>

                      {/* Subscription Manager */}
                      <div className="y2k-panel p-3 h-64 overflow-hidden flex flex-col relative group">
                           <SubscriptionManager 
                              subscriptions={subscriptions}
                              onAdd={(sub) => setSubscriptions(p => [...p, sub])}
                              onDelete={(id) => setSubscriptions(p => p.filter(s => s.id !== id))}
                           />
                      </div>

                       {/* Predictive Modelling & Frequency (Stacked) */}
                       <div className="h-64 flex flex-col gap-6">
                            <PredictiveModelling expenses={expenses} currentReserves={currentReserves} />
                            <div className="y2k-panel p-3 flex-1 relative min-h-0">
                                <div className="bg-y2k-green text-black text-xs px-2 mb-2 font-bold inline-block uppercase border border-y2k-green w-fit">Freq_Analysis</div>
                                <CategoryPieChart expenses={expenses} />
                            </div>
                       </div>
                  </div>

                  {/* Bottom Row: Daily Waveform */}
                  <div className="y2k-panel p-3 flex flex-col relative overflow-hidden min-h-[200px]">
                      <div className="bg-y2k-green text-black text-xs px-2 mb-2 font-bold inline-block uppercase border border-y2k-green w-fit">Daily_Waveform</div>
                      <div className="flex-1 min-h-0"> {/* min-h-0 crucial for flex child overflow */}
                          <DailyBarChart expenses={expenses} />
                      </div>
                  </div>
              </div>

          </main>

          {/* Footer Info */}
          <footer className="bg-zinc-900 border-t-2 border-y2k-green py-2 px-4 text-[10px] font-bold text-y2k-green uppercase flex flex-col md:flex-row justify-between tracking-wider relative z-10">
              <span className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-y2k-green rounded-full"></div>
                System Build: v2000.3.4 [Patch_05]
              </span>
              <span className="opacity-50 hidden md:block">///// MONOCORP INTERNATIONAL /////</span>
              <span className="text-y2k-cyan">Optimized for Netscape Navigator 4.0</span>
          </footer>
      </div>
      
      {/* Fixed SmartAdd Footer */}
      <SmartAdd 
        onAddExpense={(e) => setExpenses(p => [e, ...p])} 
        onAddWishlistItem={handleAddWishlistItem}
        expenses={expenses}
      />

      <BudgetModal 
        isOpen={isBudgetModalOpen} 
        onClose={() => setIsBudgetModalOpen(false)} 
        currentBudget={budgets} 
        onSave={setBudgets} 
      />
    </div>
  );
}

export default App;
