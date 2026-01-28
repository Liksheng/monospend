
import React from 'react';

interface HullIntegrityProps {
  income: number;
  totalSpent: number;
}

const HullIntegrity: React.FC<HullIntegrityProps> = ({ income, totalSpent }) => {
  // Calculate integrity percentage
  // If income is 0, assume a baseline or use budget limit logic, but here we use income as "Total Hull Points"
  const maxHull = income > 0 ? income : 1000; 
  const currentHull = Math.max(0, maxHull - totalSpent);
  const percentage = (currentHull / maxHull) * 100;
  
  let statusColor = 'bg-y2k-green shadow-[0_0_10px_#39ff14]';
  let statusText = 'OPTIMAL';
  let barAnimation = '';

  if (percentage < 20) {
      statusColor = 'bg-red-600 shadow-[0_0_15px_red]';
      statusText = 'CRITICAL';
      barAnimation = 'animate-glitch';
  } else if (percentage < 50) {
      statusColor = 'bg-yellow-400 shadow-[0_0_10px_yellow]';
      statusText = 'COMPROMISED';
  }

  return (
    <div className="y2k-panel p-3 relative overflow-hidden">
        <div className="flex justify-between items-center mb-2">
            <div className="bg-black border border-y2k-green text-y2k-green px-2 text-[10px] font-bold uppercase">
                Hull_Integrity
            </div>
            <span className={`text-xs font-bold font-mono animate-pulse ${percentage < 20 ? 'text-red-500' : 'text-y2k-green'}`}>
                {statusText}
            </span>
        </div>

        <div className="h-6 w-full bg-zinc-900 border border-zinc-700 relative p-0.5">
            <div 
                className={`h-full transition-all duration-500 ease-out ${statusColor} ${barAnimation}`}
                style={{ width: `${percentage}%` }}
            ></div>
            
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.8)_1px,transparent_1px)] bg-[size:10%_100%] pointer-events-none"></div>
            
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-black text-white mix-blend-difference tracking-widest">
                    {percentage.toFixed(1)}%
                </span>
            </div>
        </div>

        <div className="mt-1 flex justify-between text-[9px] text-zinc-500 font-mono uppercase">
            <span>Shields: {currentHull.toFixed(0)}</span>
            <span>Max: {maxHull}</span>
        </div>
    </div>
  );
};

export default HullIntegrity;
