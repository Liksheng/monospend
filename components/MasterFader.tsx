
import React, { useEffect, useState } from 'react';

interface MasterFaderProps {
  income: number;
  totalSpent: number;
}

const MasterFader: React.FC<MasterFaderProps> = ({ income, totalSpent }) => {
  const maxScale = Math.max(income, totalSpent, 1000);
  const [flickerMap, setFlickerMap] = useState<Record<number, boolean>>({});

  // Randomly flicker some LEDs to make it feel like real hardware
  useEffect(() => {
    const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * 30); 
        setFlickerMap(prev => ({
            ...prev,
            [randomIndex]: !prev[randomIndex]
        }));
        
        setTimeout(() => {
            setFlickerMap(prev => {
                const next = {...prev};
                delete next[randomIndex];
                return next;
            });
        }, 100);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const renderSegments = (value: number, color = 'bg-y2k-green', offsetIndex: number) => {
    const segments = 15;
    const percentFilled = (value / maxScale) * 100;
    const filledSegments = Math.ceil((percentFilled / 100) * segments);

    return Array.from({ length: segments }).map((_, i) => {
      const segmentIndex = segments - 1 - i;
      const isActive = segmentIndex < filledSegments;
      const globalIndex = offsetIndex + i;
      const isFlickering = flickerMap[globalIndex];
      
      let finalColor = 'bg-zinc-900/50'; // Darker empty state
      let shadow = '';
      
      if (isActive) {
          if (segmentIndex < 3) finalColor = 'bg-red-600'; 
          else if (segmentIndex < 6) finalColor = 'bg-yellow-400';
          else finalColor = color;

          shadow = 'shadow-[0_0_5px_currentColor]';
      }

      if (isFlickering && isActive) {
          shadow = '';
          return (
             <div 
                key={i} 
                className={`w-full h-1.5 mb-0.5 ${finalColor} opacity-50 transition-opacity duration-75`}
             />
          );
      }

      return (
        <div 
          key={i} 
          className={`w-full h-1.5 mb-0.5 ${finalColor} ${shadow} transition-all duration-300`}
        />
      );
    });
  };

  return (
    <div className="flex gap-4 items-end justify-center h-40 relative w-full px-2">
        
        {/* Texture */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>

        {/* Left Channel (Income) */}
        <div className="flex flex-col items-center w-12 h-full justify-end relative z-10 group">
             <div className="w-full flex flex-col-reverse border-x border-zinc-800 px-1 bg-black/40">
                {renderSegments(income, 'bg-y2k-cyan', 0)}
             </div>
             <div className="text-y2k-cyan text-[10px] mt-1 font-black tracking-widest group-hover:text-white transition-colors">IN</div>
        </div>

        {/* Middle db scale */}
        <div className="flex flex-col justify-between h-[85%] py-1 text-[9px] text-zinc-600 font-mono font-bold relative z-10 select-none">
             <span>+3</span>
             <span>0</span>
             <span>-3</span>
             <span>-6</span>
             <span>-20</span>
        </div>

        {/* Right Channel (Out) */}
        <div className="flex flex-col items-center w-12 h-full justify-end relative z-10 group">
             <div className="w-full flex flex-col-reverse border-x border-zinc-800 px-1 bg-black/40">
                 {renderSegments(totalSpent, 'bg-y2k-green', 15)}
             </div>
             <div className="text-y2k-green text-[10px] mt-1 font-black tracking-widest group-hover:text-white transition-colors">OUT</div>
        </div>

        {/* Digital Readout Side Panel */}
        <div className="flex flex-col gap-2 ml-2 relative z-10 justify-center h-full pb-4 min-w-0 flex-1 max-w-[100px]">
            <div className="text-right w-full">
                <div className="text-[8px] text-y2k-cyan uppercase mb-0.5 opacity-70">Income Lvl</div>
                <div className="bg-zinc-900 border border-y2k-cyan/30 px-2 py-1 text-right w-full overflow-x-auto custom-scrollbar whitespace-nowrap">
                     <span className="text-y2k-cyan font-bold font-mono text-sm">${income.toFixed(2)}</span>
                </div>
            </div>
            <div className="text-right w-full">
                <div className="text-[8px] text-y2k-green uppercase mb-0.5 opacity-70">Spend Lvl</div>
                <div className="bg-zinc-900 border border-y2k-green/30 px-2 py-1 text-right w-full overflow-x-auto custom-scrollbar whitespace-nowrap">
                     <span className="text-y2k-green font-bold font-mono text-sm">${totalSpent.toFixed(2)}</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default MasterFader;
